import React, { useState } from 'react';
import { View, Text, Pressable } from '../tw';
import Svg, { 
  Path, 
  Rect, 
  Circle, 
  Defs, 
  LinearGradient, 
  Stop, 
  Text as SvgText, 
  G, 
  Line 
} from 'react-native-svg';

interface MonthlyData {
  income: number;
  expense: number;
}

interface DashboardChartsProps {
  monthlyTrend: Record<string, MonthlyData>;
}

export function DashboardCharts({ monthlyTrend }: DashboardChartsProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Convert monthlyTrend to a sorted list
  const trendList = Object.entries(monthlyTrend)
    .map(([month, data]) => ({
      month, // e.g. "2026-03"
      shortMonth: month.split('-')[1] ? getMonthName(month.split('-')[1]) : month,
      income: data.income,
      expense: data.expense,
      savings: data.income - data.expense
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  function getMonthName(monthNum: string) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = parseInt(monthNum, 10) - 1;
    return months[idx] || monthNum;
  }

  if (trendList.length === 0) {
    return (
      <View className="h-40 items-center justify-center bg-[#1E1E24]/30 rounded-xl">
        <Text className="text-[#9898A3] text-xs">No trend data available</Text>
      </View>
    );
  }

  // Svg dimensions
  const svgWidth = 320;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 25;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Render Bar Chart (Credits vs Debits)
  const maxBarValue = Math.max(
    ...trendList.flatMap(t => [t.income, t.expense]),
    1000 // default minimum max value
  );

  const getBarY = (val: number) => {
    return paddingY + chartHeight - (val / maxBarValue) * chartHeight;
  };

  const getBarHeight = (val: number) => {
    return (val / maxBarValue) * chartHeight;
  };

  // Render Line Chart (Net Savings)
  const savingsValues = trendList.map(t => t.savings);
  const minSavings = Math.min(...savingsValues, 0);
  const maxSavings = Math.max(...savingsValues, 1000);
  const savingsRange = maxSavings - minSavings === 0 ? 1 : maxSavings - minSavings;

  const getLineY = (val: number) => {
    const pct = (val - minSavings) / savingsRange;
    return paddingY + chartHeight - pct * chartHeight;
  };

  // Create paths for Line Chart
  const linePoints = trendList.map((t, idx) => {
    const x = paddingX + (idx * chartWidth) / Math.max(trendList.length - 1, 1);
    const y = getLineY(t.savings);
    return { x, y, value: t.savings, label: t.shortMonth };
  });

  let linePathD = '';
  let areaPathD = '';

  if (linePoints.length > 0) {
    linePathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 1; i < linePoints.length; i++) {
      linePathD += ` L ${linePoints[i].x} ${linePoints[i].y}`;
    }

    // Area path closes the shape to the bottom of the chart
    const bottomY = paddingY + chartHeight;
    areaPathD = `${linePathD} L ${linePoints[linePoints.length - 1].x} ${bottomY} L ${linePoints[0].x} ${bottomY} Z`;
  }

  return (
    <View className="space-y-4 gap-4">
      {/* Switch Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-sm font-bold">Performance Analytics</Text>
        <View className="flex-row bg-[#1E1E24] p-1 rounded-lg">
          <Pressable 
            onPress={() => setChartType('line')}
            className={`px-3 py-1 rounded-md ${chartType === 'line' ? 'bg-[#D7FF3F]' : ''}`}
          >
            <Text className={`text-xs font-bold ${chartType === 'line' ? 'text-[#0F0F11]' : 'text-[#9898A3]'}`}>
              Savings
            </Text>
          </Pressable>
          <Pressable 
            onPress={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md ${chartType === 'bar' ? 'bg-[#D7FF3F]' : ''}`}
          >
            <Text className={`text-xs font-bold ${chartType === 'bar' ? 'text-[#0F0F11]' : 'text-[#9898A3]'}`}>
              Cashflow
            </Text>
          </Pressable>
        </View>
      </View>

      {/* SVG Canvas */}
      <View className="bg-[#1E1E24]/30 rounded-xl p-2 items-center justify-center border border-[#2E2E35]">
        <Svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <Defs>
            {/* Gradients */}
            <LinearGradient id="savingsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#D7FF3F" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#D7FF3F" stopOpacity={0.0} />
            </LinearGradient>
            <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3FFFB2" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#3FFFB2" stopOpacity={0.4} />
            </LinearGradient>
            <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FF3F55" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#FF3F55" stopOpacity={0.4} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line 
            x1={paddingX} 
            y1={paddingY} 
            x2={svgWidth - paddingX} 
            y2={paddingY} 
            stroke="#2E2E35" 
            strokeWidth="0.8" 
            strokeDasharray="4 4" 
          />
          <Line 
            x1={paddingX} 
            y1={paddingY + chartHeight / 2} 
            x2={svgWidth - paddingX} 
            y2={paddingY + chartHeight / 2} 
            stroke="#2E2E35" 
            strokeWidth="0.8" 
            strokeDasharray="4 4" 
          />
          <Line 
            x1={paddingX} 
            y1={paddingY + chartHeight} 
            x2={svgWidth - paddingX} 
            y2={paddingY + chartHeight} 
            stroke="#2E2E35" 
            strokeWidth="0.8" 
          />

          {/* Rendering Line Chart (Savings Trend) */}
          {chartType === 'line' && linePoints.length > 0 && (
            <G>
              {/* Shaded Area */}
              {areaPathD ? <Path d={areaPathD} fill="url(#savingsAreaGrad)" /> : null}

              {/* Connecting Line */}
              {linePathD ? (
                <Path 
                  d={linePathD} 
                  fill="none" 
                  stroke="#D7FF3F" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Data points */}
              {linePoints.map((pt, idx) => (
                <G key={idx}>
                  <Circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="4" 
                    fill="#D7FF3F" 
                    stroke="#0F0F11" 
                    strokeWidth="1.5" 
                  />
                  {/* Tooltip value */}
                  <SvgText
                    x={pt.x}
                    y={pt.y - 8}
                    fill="#D7FF3F"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pt.value >= 0 ? `+$${Math.round(pt.value)}` : `-$${Math.round(Math.abs(pt.value))}`}
                  </SvgText>
                  {/* Axis Label */}
                  <SvgText
                    x={pt.x}
                    y={paddingY + chartHeight + 15}
                    fill="#9898A3"
                    fontSize="10"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </SvgText>
                </G>
              ))}
            </G>
          )}

          {/* Rendering Bar Chart (Cashflow) */}
          {chartType === 'bar' && (
            <G>
              {trendList.map((t, idx) => {
                // Group width calculations
                const groupWidth = chartWidth / trendList.length;
                const groupCenterX = paddingX + idx * groupWidth + groupWidth / 2;
                
                const barWidth = Math.min(groupWidth * 0.35, 12);
                const gap = 2;

                const incomeX = groupCenterX - barWidth - gap;
                const expenseX = groupCenterX + gap;

                const incomeY = getBarY(t.income);
                const incomeH = getBarHeight(t.income);

                const expenseY = getBarY(t.expense);
                const expenseH = getBarHeight(t.expense);

                return (
                  <G key={idx}>
                    {/* Income Bar */}
                    <Rect
                      x={incomeX}
                      y={incomeY}
                      width={barWidth}
                      height={Math.max(incomeH, 2)}
                      rx="2.5"
                      fill="url(#incomeGrad)"
                    />
                    {/* Expense Bar */}
                    <Rect
                      x={expenseX}
                      y={expenseY}
                      width={barWidth}
                      height={Math.max(expenseH, 2)}
                      rx="2.5"
                      fill="url(#expenseGrad)"
                    />

                    {/* Month Label */}
                    <SvgText
                      x={groupCenterX}
                      y={paddingY + chartHeight + 15}
                      fill="#9898A3"
                      fontSize="10"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {t.shortMonth}
                    </SvgText>
                  </G>
                );
              })}

              {/* Y-Axis Legend Indicator */}
              <SvgText
                x={paddingX}
                y={paddingY - 8}
                fill="#3FFFB2"
                fontSize="8"
                fontWeight="bold"
              >
                ■ Income
              </SvgText>
              <SvgText
                x={paddingX + 60}
                y={paddingY - 8}
                fill="#FF3F55"
                fontSize="8"
                fontWeight="bold"
              >
                ■ Expense
              </SvgText>
            </G>
          )}
        </Svg>
      </View>
    </View>
  );
}
