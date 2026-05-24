import csv
from app.services.cleaner import clean_amount, normalize_date, clean_narration

def map_csv_headers(columns):
    """Maps columns of a CSV to transaction attributes dynamically."""
    mapping = {}
    for i, col in enumerate(columns):
        c = str(col).lower().strip()
        if "date" in c:
            if "val" not in c or "date" not in mapping:
                mapping["date"] = col
        elif any(k in c for k in ["narration", "particulars", "description", "remarks"]):
            mapping["narration"] = col
        elif any(k in c for k in ["withdrawal", "debit", "dr"]):
            mapping["debit"] = col
        elif any(k in c for k in ["deposit", "credit", "cr"]):
            mapping["credit"] = col
        elif "amount" in c:
            if "debit" in c or "dr" in c:
                mapping["debit"] = col
            elif "credit" in c or "cr" in c:
                mapping["credit"] = col
            else:
                mapping["amount"] = col
        elif any(k in c for k in ["balance", "bal"]):
            mapping["balance"] = col
    return mapping

def extract_transactions_csv(csv_path: str) -> list:
    """
    Parses a CSV bank statement, cleans row fields, and maps values.
    """
    transactions = []
    try:
        # Load CSV, try standard encoding first, fallback to ISO-8859-1 for Excel-compatible exports
        f = None
        try:
            f = open(csv_path, "r", encoding="utf-8")
            # Trigger a read to check for UnicodeDecodeError
            f.read(1024)
            f.seek(0)
        except UnicodeDecodeError:
            if f:
                f.close()
            f = open(csv_path, "r", encoding="ISO-8859-1")
            
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            f.close()
            return []
            
        # Clean column names
        cleaned_fieldnames = [str(c).strip() for c in reader.fieldnames if c]
        
        # Check for column mapping
        mapping = map_csv_headers(cleaned_fieldnames)
        
        # We need at least date and narration to identify transactions
        if "date" not in mapping or "narration" not in mapping:
            f.close()
            return []
            
        # Helper to find actual row key by matching stripped column name
        def find_row_key(mapped_name):
            if not mapped_name:
                return None
            for key in reader.fieldnames:
                if str(key).strip() == mapped_name:
                    return key
            return mapped_name

        date_col = find_row_key(mapping["date"])
        narration_col = find_row_key(mapping["narration"])
        debit_col = find_row_key(mapping.get("debit"))
        credit_col = find_row_key(mapping.get("credit"))
        amount_col = find_row_key(mapping.get("amount"))
        balance_col = find_row_key(mapping.get("balance"))
        
        for row in reader:
            date_val = str(row.get(date_col) or "").strip()
            narration_val = str(row.get(narration_col) or "").strip()
            
            if not date_val or date_val.lower() == "nan" or not narration_val or narration_val.lower() == "nan":
                continue
                
            balance = clean_amount(row.get(balance_col)) if balance_col else 0.0
            debit = 0.0
            credit = 0.0
            
            if debit_col and credit_col:
                debit = clean_amount(row.get(debit_col))
                credit = clean_amount(row.get(credit_col))
            elif amount_col:
                amt = clean_amount(row.get(amount_col))
                row_str = " ".join([str(x) for x in row.values() if x]).lower()
                if "cr" in row_str or "credit" in row_str:
                    credit = amt
                else:
                    debit = amt
            
            transactions.append({
                "date": normalize_date(date_val),
                "narration": clean_narration(narration_val),
                "debit": debit,
                "credit": credit,
                "balance": balance
            })
            
        f.close()
    except Exception as e:
        print(f"Error parsing CSV statement: {e}")
        
    return transactions
