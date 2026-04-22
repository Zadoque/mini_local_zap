# mini Local zap
## Work number one for distruided systems at UENF with professor Dr. Luis João Almeida filho. 

# The work itself:
```

Developer an instantly messages system inspired in the basic functionally of whatsapp, including just the text chat between users, with support to:

--send messages
--recieve messages
--delivery confirmation 
```
## about delivery confirmation:
```
The goal of this work is to practice concepts of distruided systems by implementation of multiple clients application with a server. The system must allow state syncs, events and exceptions treatment, and net comunication. I'ts not necessary interface creation, but more completed systems can be grated wtih extra scores.

```

## The MVP for this work:

### The system must allow: 
```
1 sing-out and user identification. Each user must have an unic id (phone number), name and nickname. It's not necessary  complex autentication system or criptograph. 

2 Sending messages. An user must be ablo to send textual messages to another user. Each message must have at least: (remetente ?), (destinatário ?). text content, send timestamp and message's state (sent, deliveried or seen).

3 Deliveried confirmation. The system must tell if the message was really deliveried to the (destinatário ?) and its state is correct (sent, deliveried or seen)

4 The history of messages. The messages touched between two users must be able to be (recuperadas ?)

5 Net comunication. The system must work with clients and server(s) if comunicated by net. The follow protocols are allowed: Socket, Websocket, RPC or RMI. The HTTP can be used, but it's not allowed any WEB development using browser. The choose of progamation language is free. 
```
## About tecnic requirments:
```
1 The solution must be splitted. In other words, it can't be just one local program with everything in the same memory. Must have separation between at least: 
client
server ((idalmente ?) must have a data base server for persistence)

2 The system must support concorrency. This is, two user (simultaneamente ?) connected, changing messages in  next time and correct atualization of checks. 

3 Desconection Toleration. If the (destinatáiro ? ) is offline, the sistem must lead this situation in the right way. 
```
## Accedable exemple:

Message state is sent

When reconnect, become deliveried.

then, when opened, become seen

It doesn't need to be a perfect system. but the behaivor needs to be consistence and explained. 

## What's going to be judged ( avaliado ?):

1. The system match the requirments ?
2. The checks of delivery and read works correctly ? 
3. The division in commponents is well thinked ? 
4. The group understood the problems in comunication, concorrency and syncronization ?
5. The code is organized e lead with fails ? Documentation isn't mandatory.
6. All members of the pair must know the software and understand its architeture and function of each line of code.

## Defense of the project:

You will have to present your system as a product, its pricipals advantagens and unadvantages. The code must be avaiable by github for professor at least 4 days before the presentation. The pair must explain the model and flow of messages, how they solved deliveride and seen, which limitations still are there and where the system may fall. It's interesting the presentation of the system working at live but if it's impossible, a video can be shown instead. 

# Decicions and why

1. Protocol: Websocket, why ?

