// RedDogReversal
// Author: Marek Kedzierski, @kedzie
//
//https://www.tradingview.com/script/9oa5CqxN-Red-Dog-Reversal-Intraday/
//
// VERSION HISTORY
// 20210923 - Created. mk
// 20211012 - fixed prior hlc
// 
// Adds Intraday Bubble and Alert on RDR Buy/Sell.  Thanks to Scott Redler @ T3Live
//@version=5
indicator(title="Red Dog Reversal Intraday", shorttitle="RDR", overlay=true)

alertReversal = input(false, title="Alert Reversal")
alertCrosses = input(false, title="Alert Crossover")

t = time(timeframe.period, "0930-1600")

isOpen = not na(t)

indexHighTf = barstate.isrealtime ? 1 : 0
indexCurrTf = barstate.isrealtime ? 0 : 1
prevClose = request.security(syminfo.ticker, 'D', close[indexHighTf], barmerge.gaps_off, barmerge.lookahead_off)[indexCurrTf]
prevHigh = request.security(syminfo.ticker, 'D', high[indexHighTf], barmerge.gaps_off, barmerge.lookahead_off)[indexCurrTf]
prevLow = request.security(syminfo.ticker, 'D', low[indexHighTf], barmerge.gaps_off, barmerge.lookahead_off)[indexCurrTf]

//enum definitions
rdr_closed = 0
rdr_crossed_below_low = 1
rdr_below = 2
rdr_crossed_above_low = 3
rdr_inside = 4
rdr_crossed_below_high = 5
rdr_above = 6
rdr_crossed_above_high = 7
rdr_sell = 8
rdr_buy = 9

rdrState = rdr_closed

// RDR state machine
rdrState := if not isOpen
    rdr_closed
else if close > prevHigh
    switch rdrState[1]
        rdr_closed => rdr_above
        rdr_below => rdr_crossed_above_high //NaN
        rdr_above => rdr_above
        rdr_inside => rdr_crossed_above_high
        rdr_crossed_above_high => rdr_crossed_above_high
        rdr_crossed_above_low => rdr_crossed_above_high
        rdr_crossed_below_low => rdr_buy //NaN
        rdr_crossed_below_high => rdr_above
        rdr_sell => rdr_crossed_above_high
        rdr_buy => rdr_buy
else if close < prevLow
    switch rdrState[1]
        rdr_closed => rdr_below
        rdr_below => rdr_below
        rdr_above => rdr_crossed_below_low //NaN
        rdr_inside => rdr_crossed_below_low
        rdr_crossed_above_high => rdr_sell //NaN
        rdr_crossed_above_low => rdr_below
        rdr_crossed_below_low => rdr_crossed_below_low
        rdr_crossed_below_high => rdr_crossed_below_low
        rdr_sell => rdr_sell
        rdr_buy => rdr_crossed_below_low
else //inside
    switch rdrState[1]
        rdr_closed => rdr_inside
        rdr_below => rdr_crossed_above_low
        rdr_above => rdr_crossed_below_high
        rdr_inside => rdr_inside
        rdr_crossed_above_high => rdr_sell
        rdr_crossed_above_low => rdr_crossed_above_low
        rdr_crossed_below_low => rdr_buy
        rdr_crossed_below_high => rdr_crossed_below_high
        rdr_sell => rdr_sell
        rdr_buy => rdr_buy

// Plots
plot(prevClose, title="Prev Close", style=plot.style_line, linewidth=2, color=color.white)
if alertCrosses and isOpen and ta.crossover(close, prevClose)
    alert(str.format("{0} crossed above prior day close", syminfo.ticker), alert.freq_once_per_bar)
if alertCrosses and isOpen and ta.crossunder(close, prevClose)
    alert(str.format("{0} crossed below prior day close", syminfo.ticker), alert.freq_once_per_bar)  

plot(prevHigh, title="Prev High", style=plot.style_line, linewidth=2, color=color.red)
if alertCrosses and isOpen and ta.crossover(close, prevHigh)
    alert(str.format("{0} crossed above prior day high", syminfo.ticker), alert.freq_once_per_bar)
if alertCrosses and isOpen and ta.crossunder(close, prevHigh)
    alert(str.format("{0} crossed below prior day high", syminfo.ticker), alert.freq_once_per_bar)  
    
plot(prevLow, title="Prev Low", style=plot.style_line, linewidth=2, color=color.green)
if alertCrosses and isOpen and ta.crossover(close, prevLow)
    alert(str.format("{0} crossed above prior day low", syminfo.ticker), alert.freq_once_per_bar)
if alertCrosses and isOpen and ta.crossunder(close, prevLow)
    alert(str.format("{0} crossed below prior day low", syminfo.ticker), alert.freq_once_per_bar)  

//Bubbles
if rdrState == rdr_buy and rdrState[1] != rdr_buy
    label.new(x=bar_index, y=close, yloc=yloc.price, text = "RDR Buy", style=label.style_label_up, color=color.green)
if rdrState == rdr_sell and rdrState[1] != rdr_sell
    label.new(x=bar_index, y=close, yloc=yloc.price, text = "RDR Sell", style=label.style_label_down, color=color.red)

//Alerts
if alertReversal and rdrState == rdr_buy and rdrState[1] != rdr_buy
    alert(str.format("RDR Buy {0}", syminfo.ticker), alert.freq_once_per_bar)
if alertReversal and rdrState == rdr_sell and rdrState[1] != rdr_sell
    alert(str.format("RDR Sell {0}", syminfo.ticker), alert.freq_once_per_bar)

// Debug plot (useful in lower subgraph)
//plot(rdrState, title="RDR State Machine")