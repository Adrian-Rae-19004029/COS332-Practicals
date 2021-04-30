f = open("time_zone_value.txt", "w")
f.write("2")
f.close()

from datetime import datetime
from datetime import timedelta

f = open("time_zone_value.txt", "r")
GMT_plus = int(f.read())
f.close()


time_difference = timedelta(hours=(GMT_plus-2))
time = datetime.now() + time_difference

print("<!DOCTYPE html>")
print("<html>")
print("<head>")
print("	<title>COS332 Assignment 1</title>")
print("</head>")
print("<body>")
location = ""
if(GMT_plus==2):
	location = "South Africa"
else:
	location = "Ghana"

print("The current time in",location,"is",str(time.hour)+":"+str(time.minute)+". <br>")
print("<a href='set2.py'> Switch to South African Time</a><br>")
print("<a href='set0.py'> Switch to Ghanan Time</a>")
print("</body>")
print("</html>")
