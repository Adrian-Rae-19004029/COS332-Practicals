import socket
from _thread import *
import telnetlib

PROXY_HOST = '127.0.0.1'  # Standard loopback interface address (localhost)
PROXY_PORT = 1066  # Port to listen on (non-privileged ports are > 1023)
SOCKET = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

TARGET_HOST = 'localhost'
TARGET_PORT = 23
MAX_MESSAGE_SIZE = 65535

def read_until_cooked(conn):
    response = ""
    while True:
        try:
            data = conn.read_until(b"Non-Matching",1)
            response += data.decode('ascii')
            if data == b"":
                break
        except EOFError as e:
            break
    return response

def handle_client_connection(conn, options):
    input_buffer = []
    print("connected to: " + options['host'] + ":" + options['port'])
    conn.send(str.encode("[{}][{}] Welcome to the Proxy server:\r\n".format(options['host'], options['port'])))

    TARGET = telnetlib.Telnet(TARGET_HOST, TARGET_PORT)
    conn.send(read_until_cooked(TARGET).encode())

    TARGET.write(b"adrianraehome@gmail.com\r\n")
    conn.send(read_until_cooked(TARGET).encode())

    TARGET.write(b"Bl@derunner6\r\n")

    conn.send(read_until_cooked(TARGET).encode())
    while True:
        data = conn.recv(1024)
        input_char = data.decode("utf-8")
        if not data:
            break
        elif input_char == "\r\n":
            # GET COMMAND
            command = "".join(input_buffer)
            # conn.send(str.encode("Your command was: {}\r\n".format(command)))
            if ("PS " in command.upper()[:3]) or ("PS" in command.upper()[:3]):
                conn.send(b'[DENIED] The Proxy cannot execute this command.\r\n')
            elif command.upper() == "QUIT":
                # SPECIAL TREATMENT OF QUITTING
                break
            else:
                # HANDLE COMMANDS
                # DO STUFF WITH TARGET HERE
                raw_line = str.encode(command+'\r\n')
                TARGET.write(raw_line)
                TARGET.read_until(raw_line)
                response_to_message = read_until_cooked(TARGET)
                conn.send(response_to_message.encode())
                if response_to_message == "logout\r\n":
                    break
            # CLEAR INPUT BUFFER
            input_buffer = []
        else:
            input_buffer.append(input_char)
    TARGET.close()
    conn.close()
    print("disconnected from: " + options['host'] + ":" + options['port'])


try:
    SOCKET.bind((PROXY_HOST, PROXY_PORT))
    SOCKET.listen()
    print("Waiting for a connection...")
    while True:
        conn, addr = SOCKET.accept()
        options = {"host": str(addr[0]), "port": str(addr[1])}
        start_new_thread(handle_client_connection, (conn, options,))
except socket.error as e:
    print(str(e))
except KeyboardInterrupt:
    print("LOL, u dead")



