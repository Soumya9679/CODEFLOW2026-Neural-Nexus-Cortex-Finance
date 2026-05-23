import React from "react";

function TransactionTable() {
  return (
    <div className="transaction-section">

      <h2>Recent Transactions</h2>

      <table className="transaction-table">

        <thead>
          <tr>
            <th>Date</th>
            <th>Merchant</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>12 May</td>
            <td>Amazon</td>
            <td>Shopping</td>
            <td>₹2,500</td>
          </tr>

          <tr>
            <td>14 May</td>
            <td>Swiggy</td>
            <td>Food</td>
            <td>₹450</td>
          </tr>
        </tbody>

      </table>

    </div>
  );
}

export default TransactionTable;