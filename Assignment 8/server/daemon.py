from pyftpdlib.authorizers import DummyAuthorizer
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer

FTP_PORT = 21
FTP_USER = "admin"
FTP_PASSWORD = "admin"
FTP_DIRECTORY = "/xampp/htdocs/COS332/Assignment 8/server/synced/"
FTP_HOST_ADDRESS = "0.0.0.0"

FTP_MAX_CONNECTIONS = 10
FTP_MAX_CONNECTIONS_PER_IP = 5


def main():

    print("[Please enter the following parameters to create and access the FTP Daemon]")
    FTP_USER = str(input('Username: '))
    FTP_PASSWORD = str(input('Password: '))
    FTP_PORT = int(input('Port: '))

    authorizer = DummyAuthorizer()
    authorizer.add_user(FTP_USER, FTP_PASSWORD, FTP_DIRECTORY, perm='elradfmw')
    handler = FTPHandler
    handler.authorizer = authorizer

    handler.banner = "[Welcome to the File Synchronisation Service]"
    address = (FTP_HOST_ADDRESS, 21)

    server = FTPServer(address, handler)
    server.max_cons = FTP_MAX_CONNECTIONS
    server.max_cons_per_ip = FTP_MAX_CONNECTIONS_PER_IP

    server.serve_forever()


if __name__ == '__main__':
    main()