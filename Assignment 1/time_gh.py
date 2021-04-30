from datetime import datetime
from datetime import timedelta
lag = timedelta(hours=-2);
time = datetime.now() + lag;
print("<!DOCTYPE html>");
print("</!DOCTYPE html>");
print("<html>");
print("<head>");
print("	<title>COS332 Assignment 1</title>");
print("</head>");
print("<body>");
print("The current time in Ghana is",str(time.hour)+":"+str(time.minute)+".");
print("</body>");
print("</html>");