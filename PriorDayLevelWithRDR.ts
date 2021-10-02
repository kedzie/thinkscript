# PriorDayLevelWithRDR
# Author: Marek Kedzierski, @kedzie
#
# VERSION HISTORY (sortable date and time (your local time is fine), and your initials
# 20210923 - Created.
# Displays prior day's low/high/close
# Alerts when levels are lost/reclaimed
# Adds Bubbleand Alert on RDR Buy/Sell.  Thanks to Scott Redler @ T3Live

input marker = { default close, high, low };
input alertCrosses = no;
input alertRDR = no;

def beforeStart = GetTime() < RegularTradingStart(GetYYYYMMDD());
def afterEnd = GetTime() > RegularTradingEnd(GetYYYYMMDD());

def PrevDay;
switch (marker) {
    case close:
        PrevDay = close(period = "DAY")[1];
    case high:
        PrevDay = high(period = "DAY")[1];
    case low:
        PrevDay = low(period = "DAY")[1];
}

def rdrState = { default closed, below, above, crossed_below, crossed_above, rdr };

if afterEnd or beforeStart {
    rdrState = rdrState.closed;
} else if close > PrevDay {
    switch (rdrState[1]) {
    case closed:
        rdrState = rdrState.above;
    case above:
        rdrState = rdrState.above;
    case below:
        rdrState = rdrState.crossed_above;
    case crossed_above:
        rdrState = rdrState.crossed_above;
    case crossed_below:
        rdrState = if marker == marker.low then rdrState.rdr else rdrState.above;
    case rdr:
        rdrState = if marker == marker.low then rdrState.rdr else rdrState.crossed_above;
}
} else {  #close < PrevDay
    switch (rdrState[1]) {
    case closed:
        rdrState = rdrState.below;
    case above:
        rdrState =  rdrState.crossed_below;
    case below:
        rdrState = rdrState.below;
    case crossed_below:
        rdrState = rdrState.crossed_below;
    case crossed_above:
        rdrState = if marker == marker.high then rdrState.rdr else rdrState.below;
    case rdr:
        rdrState = if marker == marker.high then rdrState.rdr else rdrState.crossed_below;
}
}

AddChartBubble(rdrState == rdrState.rdr AND rdrState[1] != rdrState.rdr,
                close, "RDR " + if marker == marker.low THEN "Buy" ELSE "Sell", 
                if marker == marker.low THEN Color.GREEN ELSE Color.RED, marker == marker.high);

plot PrevDayPlot = PrevDay;
PrevDayPlot.SetDefaultColor(GetColor(9));
PrevDayPlot.SetPaintingStrategy(PaintingStrategy.LINE);
PrevDayPlot.SetStyle(Curve.SHORT_DASH);
PrevDayPlot.SetLineWeight(2);

#
# Debug Plots (useful in lower subgraph)
#
# plot debug = rdrState;
# debug.Hide();
# debug.SetDefaultColor(GetColor(1));

Alert(alertCrosses and close crosses above PrevDay, "Crossed above previous " + marker, Alert.BAR, Sound.Ding);
Alert(alertCrosses and close crosses below PrevDay, "Crossed below previous " + marker, Alert.BAR, Sound.Ding);

Alert(alertRDR AND rdrState == rdrState.rdr AND rdrState[1] != rdrState.rdr, 
    "RDR " + IF marker == marker.low THEN "Buy" ELSE "Sell", Alert.BAR, Sound.Ring);