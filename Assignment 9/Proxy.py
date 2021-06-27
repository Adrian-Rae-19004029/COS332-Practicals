import socket
from _thread import *
import telnetlib

PROXY_HOST = '127.0.0.1'  # Standard loopback interface address (localhost)
PROXY_PORT = 1066  # Port to listen on (non-privileged ports are > 1023)
SOCKET = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

TARGET_HOST = 'localhost'
TARGET_PORT = 8023
MAX_MESSAGE_SIZE = 65535

try:
    SOCKET.bind((PROXY_HOST, PROXY_PORT))
except socket.error as e:
    print(str(e))

SOCKET.listen()
print("Waiting for a connection...")


def handle_client_connection(conn, options):
    input_buffer = []
    print("connected to: " + options['host'] + ":" + options['port'])
    conn.send(str.encode("[{}][{}] Welcome to the Proxy server:\r\n".format(options['host'], options['port'])))

    while True:
        data = conn.recv(1024)
        input_char = data.decode("utf-8")
        if not data:
            break
        elif input_char == "\r\n":
            # GET COMMAND
            command = "".join(input_buffer)
            conn.send(str.encode("Your command was: {}\r\n".format(command)))
            if ("PS " in command.upper()[:3]) or ("PS" in command.upper()[:3]):
                conn.send(b'[DENIED] The Proxy cannot execute this command.\r\n')
            elif command.upper() == "QUIT":
                # SPECIAL TREATMENT OF QUITTING
                break
            else:
                # HANDLE COMMANDS
                # DO STUFF WITH TARGET HERE
                TARGET = telnetlib.Telnet(TARGET_HOST, TARGET_PORT)
                TARGET.write(str.encode(command+'\r\n'))
                case_data = TARGET.read_all()
                conn.send(str.encode(str(case_data)+'\r\n'))
                TARGET.close()

            # CLEAR INPUT BUFFER
            input_buffer = []
        else:
            input_buffer.append(input_char)

    conn.close()
    print("disconnected from: " + options['host'] + ":" + options['port'])


while True:
    conn, addr = SOCKET.accept()
    options = {"host": str(addr[0]), "port": str(addr[1])}
    start_new_thread(handle_client_connection, (conn, options,))
