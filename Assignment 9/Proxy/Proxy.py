import socket
import sys
from _thread import *
import telnetlib
import getpass

PROXY_HOST = '127.0.0.1'  # Standard loopback interface address (localhost)
PROXY_PORT = 1066  # Port to listen on (non-privileged ports are > 1023)
SOCKET = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

TARGET_HOST = 'localhost'
TARGET_PORT = 23
MAX_MESSAGE_SIZE = 65535
RESTRICTED_KEYWORDS = ['PS', 'IPCONFIG', 'ARP']
EXIT_KEYWORDS = ['QUIT', 'EXIT']

TARGET_USER = "admin"
TARGET_PASS = "admin"


def read_until_cooked(conn):
    response = ""
    while response == "":
        data = conn.read_until(b"3a45e4ac-f4dd-40ff-b00e-6aec0d29944d", 0.01)
        response += data.decode('ascii')
    return response


def login(c, t):
    c.send(read_until_cooked(t).encode())
    t.write(str.encode(TARGET_USER + "\r\n"))
    conn.send(read_until_cooked(t).encode())
    t.write(str.encode(TARGET_PASS + "\r\n"))

def handle_commands(c, t, command_array):

    CONTINUE = True
    for command in command_array:
        KEYWORD = command.upper().split(" ")[0]
    
        # Process, but don't show output of restricted operations
        if KEYWORD in RESTRICTED_KEYWORDS:
            c.send(str.encode(
                '[DENIED] The Proxy cannot deliver privileged information revealed by the {} command.\r\n'.format(
                    KEYWORD)))
            raw_line = str.encode(command + '\r\n')
            t.write(raw_line)
            t.read_until(raw_line)
            response_to_message = read_until_cooked(t)
            terminal_line = response_to_message.split("\r\n")[-1]
            c.send(terminal_line[0:terminal_line.index(">") + 1].encode())
    
        # Close the channel on call for exit keyword
        elif command.upper() in EXIT_KEYWORDS:
            raw_line = str.encode("exit" + '\r\n')
            t.write(raw_line)
            t.read_until(raw_line)
            c.send(t.read_all())
            CONTINUE = False
            break
    
        # Else, is a generic command
        else:
            raw_line = str.encode(command + '\r\n')
            t.write(raw_line)
            # IE - don't re-read the entered command
            t.read_until(raw_line)
            # But just the response
            response_to_message = read_until_cooked(t)
            c.send(response_to_message.encode())
    return CONTINUE

def get_client_text(conn):
    response = ""
    while True:
        input_char = conn.recv(1024).decode("utf-8")
        if input_char=="\r\n":
            break
        response += input_char
    return response

def handle_client_connection(conn, options):
    # Create an input buffer
    input_buffer = []

    # Get Client Details
    CLIENT_HOST = options['host']
    CLIENT_PORT = options['port']

    conn.send(b"Please enter the target host: ")
    TARGET_HOST = get_client_text(conn)
    conn.send(b"Please enter the target port: ")
    TARGET_PORT = int(get_client_text(conn))

    print("New Client Connected: " + CLIENT_HOST + ":" + CLIENT_PORT)
    conn.send(str.encode(
        "[{}][{}] Awaiting tunnel to [{}][{}]...\r\n".format(CLIENT_HOST, CLIENT_PORT, TARGET_HOST, TARGET_PORT)))

    # Create a telnet channel to the target - login
    TARGET = telnetlib.Telnet(TARGET_HOST, TARGET_PORT)
    print("Auto-configuring Login... \r\n")
    login(conn, TARGET)

    # Get the header message
    conn.send(read_until_cooked(TARGET).encode())

    # Character stream
    while True:
        # Get a character
        data = conn.recv(1024)
        input_char = data.decode("utf-8")
        if not data:
            break
        # if the character is 'enter', parse the command in the buffer and send it through
        elif input_char == "\r\n":
            commands = [s.strip() for s in "".join(input_buffer).split('&')]

            print("[{}][{}] Entered commands: <{}>".format(CLIENT_HOST, CLIENT_PORT, commands))
            if not handle_commands(conn, TARGET, commands):
                break
            # Clear buffer after command is sent
            input_buffer = []

        # If there's no backspace, save the char to the input stream
        elif input_char != '\x08':
                input_buffer.append(input_char)

    TARGET.close()
    conn.send(b"Your session with the target has been terminated.\r\n")
    conn.close()
    print("Client Terminated Session: " + CLIENT_HOST + ":" + CLIENT_PORT)


try:
    PROXY_HOST = str(sys.argv[1])
    PROXY_PORT = int(sys.argv[2])

    TARGET_USER = str(input("Target Username: "))
    TARGET_PASS = str(getpass.getpass(prompt="Target Password: "))

    print("Starting PROXY on {}:{}".format(PROXY_HOST, PROXY_PORT))
    SOCKET.bind((PROXY_HOST, PROXY_PORT))
    SOCKET.listen()
    print("Waiting for a connection...")
    while True:
        conn, addr = SOCKET.accept()
        options = {"host": str(addr[0]), "port": str(addr[1])}
        start_new_thread(handle_client_connection, (conn, options,))
except socket.error as e:
    print(str(e))
except IndexError as e:
    sys.exit("No system arguments for host or port were given.")
