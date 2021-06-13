import poplib


def get_sender(index, pop_client):
    top_line = str(pop_client.top(index, 1))
    half_line = top_line[top_line.find("From:") + 6:]
    return half_line[:half_line.find("\'")]


def get_subject(index, pop_client):
    top_line = str(pop_client.top(index, 1))
    half_line = top_line[top_line.find("Subject:") + 9:]
    return half_line[:half_line.find("\'")]


def get_size(index, pop_client):
    top_line = str(pop_client.list(index))
    top_line = top_line[top_line.index(" ") + 1:]
    half_line = top_line[top_line.find(" ") + 1:]
    return int(half_line[:half_line.find("\'")])


def get_num_messages(pop_client):
    top_line = str(pop_client.list())
    half_line = top_line[top_line.find(" ") + 1:]
    return int(half_line[:half_line.find("messages") - 1])


def get_email_table(pop_client):
    n = get_num_messages(pop_client)
    table = []
    for j in range(n):
        i = j + 1
        table.append({"Sender": get_sender(i, pop_client), "Subject": get_subject(i, pop_client),
                      "Size": get_size(i, pop_client)})
    return table


def delete_mail(index, pop_client):
    pop_client.dele(index)


def retrieve_listing(inHost, inPort, inUser, inPassword):
    pop_client = poplib.POP3_SSL(inHost, str(inPort))
    pop_client.user(inUser)
    pop_client.pass_(inPassword)
    table = get_email_table(pop_client)
    pop_client.quit()
    return table


def delete_listing(index, inHost, inPort, inUser, inPassword):
    pop_client = poplib.POP3_SSL(inHost, str(inPort))
    pop_client.user(inUser)
    pop_client.pass_(inPassword)
    delete_mail(index, pop_client)
    pop_client.quit()
    return True


print(retrieve_listing("pop.gmail.com", 995, "adrianraehome@gmail.com", "Bl@derunner6"))
print(delete_listing(1, "pop.gmail.com", 995, "adrianraehome@gmail.com", "Bl@derunner6"))
print(retrieve_listing("pop.gmail.com", 995, "adrianraehome@gmail.com", "Bl@derunner6"))