import datetime
import os
import socket
import sys
import time
from pathlib import Path
import getpass

SERVER_NAME = "127.0.0.1"
SERVER_PORT = 21
SERVER_ENCODING = "latin-1"
MAX_BUFFER_SIZE = 8192

IS_CONSTANT = True
WAIT_TIME = 10

USER = "admin"
PASS = "admin"


def get_transfer_host_and_port(resp):
    import re as regular_expr
    conn_expr = regular_expr.compile(r'(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)', regular_expr.ASCII)
    m = conn_expr.search(resp)
    number_set = m.groups()
    host = '.'.join(number_set[:4])
    port = (int(number_set[4]) << 8) + int(number_set[5])
    return host, port


def send(socket, message, line_end=True, log_events=False):
    if log_events:
        print("[Sending Message] {}".format(message))
    suffix = "\r\n" if line_end else ""
    socket.sendall(bytearray((message + suffix).encode()))
    recv = socket.recv(1024)
    if log_events:
        print("[Received Response] {}".format(recv))
    return recv


def monitor(file_name, callback=print):
    total_epoch_time = os.path.getmtime(file_name)
    file_last_modified = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(total_epoch_time))
    while True:

        output_time = datetime.datetime.now().strftime("%H:%M:%S")
        print("[{}] | [{}] [Last Modified : {}]".format(output_time, file_name, file_last_modified), end='\r')
        case_epoch_time = os.path.getmtime(file_name)
        case_last_modified = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(case_epoch_time))
        if str(file_last_modified) != str(case_last_modified):
            file_last_modified = case_last_modified
            callback(file_name)

        # WAIT FOR A CERTAIN AMOUNT OF TIME IF NOT CHECKING CONSTANTLY
        if not IS_CONSTANT:
            time.sleep(WAIT_TIME)


def update_file(file_name):
    CLIENT_SOCKET = socket.create_connection((SERVER_NAME, SERVER_PORT))
    header = CLIENT_SOCKET.recv(1024)
    send(CLIENT_SOCKET, "USER {}".format(USER))
    send(CLIENT_SOCKET, "PASS {}".format(PASS))
    send(CLIENT_SOCKET, "TYPE I")
    transfer_resp = send(CLIENT_SOCKET, "PASV")
    transfer_host, transfer_port = get_transfer_host_and_port(str(transfer_resp))
    transfer_socket = socket.create_connection((transfer_host, transfer_port))
    fp = open(file_name, 'rb')
    p = Path(FILE_NAME)
    simple_name = p.stem + p.suffix
    send(CLIENT_SOCKET, "STOR {}".format(simple_name))

    with transfer_socket as conn:
        buf = fp.read(MAX_BUFFER_SIZE)
        conn.sendall(buf)
    fp.close()
    send(CLIENT_SOCKET, "QUIT")


# MAIN PROGRAM
try:
    SERVER_NAME = str(sys.argv[1])
    SERVER_PORT = int(sys.argv[2])
except Exception as e:
    exit("[Please enter a host and port as system arguments]")

USER = str(input("FTP Server User: "))
PASS = str(getpass.getpass("FTP Server Pass: "))

try:
    tester = socket.create_connection((SERVER_NAME, SERVER_PORT))
    tester.recv(1024)
    send(tester, "USER {}".format(USER))
    res = str(send(tester, "PASS {}".format(PASS)))
    valid = "530" not in res
    if not valid:
        raise Exception
except Exception as e:
    exit("[INVALID CONN: {} {} | @{}]".format(SERVER_NAME, SERVER_PORT, USER))
print("[VALID CONN: {} {} | @{}]".format(SERVER_NAME, SERVER_PORT, USER))

FILE_NAME = str(input("File to Track: "))
try:
    open(FILE_NAME).close()
except Exception as e:
    exit("[The selected file <{}> does not exist]".format(FILE_NAME))

monitor(FILE_NAME, update_file)
