# MovAvgExponentialPeriod
# Author: Marek Kedzierski, @kedzie
#
# VERSION HISTORY (sortable date and time (your local time is fine), and your initials
# 20210923 - Created.
# Displays Daily/Monthly EMA on intraday chart
# Alerts when EMA is lost/reclaimed

input period = AggregationPeriod.DAY;
input length = 8;
input displace = 0;
input showBreakoutSignals = no;
input alertCrosses = no;

def beforeStart = GetTime() < RegularTradingStart(GetYYYYMMDD());
def afterEnd = GetTime() > RegularTradingEnd(GetYYYYMMDD());

plot AvgExp = ExpAverage(close(GetSymbol(), period)[-displace], length);

AvgExp.SetDefaultColor(GetColor(1));

plot UpSignal = close crosses above AvgExp;
plot DownSignal = close crosses below AvgExp;
UpSignal.SetHiding(!showBreakoutSignals);
DownSignal.SetHiding(!showBreakoutSignals);
UpSignal.SetDefaultColor(Color.UPTICK);
UpSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
DownSignal.SetDefaultColor(Color.DOWNTICK);
DownSignal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

Alert(alertCrosses and !beforeStart and !afterEnd and UpSignal, "Crossed Above EMA " + length, Alert.BAR, Sound.Ding);
Alert(alertCrosses and !beforeStart and !afterEnd and DownSignal, "Crossed Below EMA " + length, Alert.BAR, Sound.Ding);