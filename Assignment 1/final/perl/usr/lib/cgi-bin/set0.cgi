#!/usr/bin/perl
use POSIX qw(strftime);
open(FH,">data/time_zone_value.txt") or die "Couldn't open file time_zone_value.txt, $!";
print FH "0";
close(FH);


#========== Contents of time.cgi ===============
print "Content-type:text/html\r\n\r\n";

open(DATA, "<data/time_zone_value.txt") or die "Couldn't open file time_zone_value.txt, $!";
$GMTPLUS = 0;
while(<DATA>){
$GMTPLUS = $GMTPLUS + $_;
}

$t = time();
$t = $t - (2-$GMTPLUS)*60*60;
$time = localtime($t);

print "<html>";
print "<head>";
print "<title>COS332 Assignment 1</title>";
print "</head>";
print "<body>";
$location = "";
if($GMTPLUS==2){
	$location = "South Africa";
}else{
	$location = "Ghana";
}
print strftime("The current time in ".$location." is %H:%M <br>",localtime($t));
print "<a href='set2.cgi'> Switch to South African Time</a><br>";
print "<a href='set0.cgi'> Switch to Ghanan Time</a>";
print "</body>" ;
print "</html>" ;

1;
