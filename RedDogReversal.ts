# RedDogReversal
# Author: Marek Kedzierski, @kedzie
#
# VERSION HISTORY (sortable date and time (your local time is fine), and your initials
# 20210923 - Created.
# ...
# Adds Bubbleand Alert on RDR Buy/Sell.  Thanks to Scott Redler @ T3Live
declare hide_on_daily;
input alert = no;

def beforeStart = GetTime() < RegularTradingStart(GetYYYYMMDD());
def afterEnd = GetTime() > RegularTradingEnd(GetYYYYMMDD());

def prevHigh = high(period = "DAY")[1];
def prevLow = low(period = "DAY")[1];

def rdrState = { default closed, crossed_below_low, below, crossed_above_low, inside, crossed_below_high, above, crossed_above_high, rdr_sell, rdr_buy };

if afterEnd or beforeStart {
    rdrState = rdrState.closed;
} else if close > prevHigh {
    switch (rdrState[1]) {
    case closed:
        rdrState = rdrState.above;
     case below: #NaN
         rdrState = rdrState.above;
    case above:
        rdrState =  rdrState.above;
    case inside:
        rdrState = rdrState.crossed_above_high;
    case crossed_above_high:
        rdrState = rdrState.crossed_above_high;
    case crossed_above_low:
        rdrState = rdrState.crossed_above_high;
    case crossed_below_low: #NaN
         rdrState = rdrState.above;
    case crossed_below_high:
        rdrState = rdrState.above;
    case rdr_sell:
        rdrState = rdrState.crossed_above_high;
    case rdr_buy:
        rdrState = rdrState.rdr_buy;
    }
} else if close < prevLow {
    switch (rdrState[1]) {
    case closed:
        rdrState = rdrState.below;
    case below:
         rdrState = rdrState.below;
    case above:  #NaN
        rdrState =  rdrState.below;
    case inside:
        rdrState = rdrState.crossed_below_low;
    case crossed_above_high:  #NaN
        rdrState = rdrState.below;
    case crossed_above_low:
        rdrState = rdrState.below;
    case crossed_below_low:
         rdrState = rdrState.crossed_below_low;
    case crossed_below_high:
        rdrState = rdrState.crossed_below_low;
    case rdr_sell:
        rdrState = rdrState.rdr_sell;
    case rdr_buy:
        rdrState = rdrState.crossed_below_low;
    }
} else {  #inside
    switch (rdrState[1]) {
    case closed:
        rdrState = rdrState.inside;
    case below:
         rdrState = rdrState.crossed_above_low;
    case above:  
        rdrState =  rdrState.crossed_below_high;
    case inside:
        rdrState = rdrState.inside;
    case crossed_above_high:
        rdrState = rdrState.rdr_sell;
    case crossed_above_low:
        rdrState = rdrState.crossed_above_low;
    case crossed_below_low:
         rdrState = rdrState.rdr_buy;
    case crossed_below_high:
        rdrState = rdrState.crossed_below_high;
    case rdr_sell:
        rdrState = rdrState.rdr_sell;
    case rdr_buy:
        rdrState = rdrState.rdr_buy;
    }
}

#
# Bubbles
#
AddChartBubble(rdrState == rdrState.rdr_buy AND rdrState[1] != rdrState.rdr_buy,
                close, "RDR Buy", Color.GREEN, no);
AddChartBubble(rdrState == rdrState.rdr_sell AND rdrState[1] != rdrState.rdr_sell,
                close, "RDR Sell", Color.RED, yes);
#
# Alerts
#
Alert(alert AND rdrState == rdrState.rdr_buy AND rdrState[1] != rdrState.rdr_buy, "RDR Buy", Alert.BAR, Sound.Ring);
Alert(alert AND rdrState == rdrState.rdr_sell AND rdrState[1] != rdrState.rdr_sell, "RDR Sell", Alert.BAR, Sound.Ring);

#
# plots
#
plot debug = rdrState;
debug.Hide();
debug.SetDefaultColor(GetColor(1));