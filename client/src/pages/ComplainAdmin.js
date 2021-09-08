// import hook
import React, { useState, useEffect, useContext } from 'react'

import NavbarAdmin from '../components/NavbarAdmin'

import { Container, Row, Col } from 'react-bootstrap'
import Contact from '../components/complain/Contact'
import Chat from '../components/complain/Chat'
// import UserContext
import { UserContext } from '../context/userContext'

// import socket.io-client 
import {io} from 'socket.io-client'

// initial variable outside socket
let socket
export default function ComplainAdmin() {
    const [contact, setContact] = useState(null)
    const [contacts, setContacts] = useState([])
    const [messages, setMessages] = useState([])

    const title = "Complain admin"
    document.title = 'DumbMerch | ' + title

    const [state] = useContext(UserContext)

    useEffect(() =>{
        socket = io('http://localhost:5000', {
            auth: {
                token: localStorage.getItem('token')
            },
            query: {
                id: state.user.id
            }
        })

        socket.on("new message", () => {
            socket.emit("load messages", contact?.id)
        })
        
        // listen error sent from server
        socket.on("connect_error", (err) => {
            console.error(err.message); // not authorized
          });

        loadContacts()
        loadMessages()

        return () => {
            socket.disconnect()
        }
    }, [messages]) //  add message to dependencies array to re-render after messages update

    const loadContacts = () => {
        socket.emit("load customer contacts")
        socket.on("customer contacts", (data) => {
            // filter just customers which have sent a message
            let dataContacts = data.filter(item => (item.status !== "admin") && 
            (item.recipientMessage.length > 0 || item.senderMessage.length > 0))
            // manipulate customers to add message property with the newest message
            dataContacts = dataContacts.map(item => ({
                id:item.id,
                name: item.name,
                profile: item.profile,
                message: item.senderMessage[item.senderMessage.length - 1].message
            }))
            setContacts(dataContacts)
            socket.emit("load messages", data.id)
        })
    }

    // used for active style when click contact
    const onClickContact = (data) => {
        setContact(data)
        socket.emit("load messages", data.id)
    }

    const loadMessages = () => {
        socket.on("messages", (data) => {
            if (data.length > 0) {
                const dataMessages = data.map(item => ({
                    idSender: item.sender.id,
                    message: item.message
                }))
                setMessages(dataMessages)
            }
        })
        const chatMessages = document.getElementById("chat-messages")
        chatMessages.scrollTop = chatMessages?.scrollHeight
    }

    const onSendMessage = (e) => {
        if (e.key === "Enter") {
            const data = {
                idRecipient: contact.id,
                message: e.target.value
            }
            socket.emit("send message", data)
            e.target.value = ""
        }
    }

    return (
        <>
            <NavbarAdmin title={title} />
            <Container fluid style={{height: '89.5vh'}}>
                <Row>
                    <Col md={3} style={{height: '89.5vh'}} className="px-3 border-end border-dark overflow-auto">
                        <Contact dataContact={contacts} clickContact={onClickContact} contact={contact}/>
                    </Col>
                    <Col md={9} style={{maxHeight: '89.5vh'}} className="px-0">
                        <Chat contact={contact} messages={messages} user={state.user} sendMessage={onSendMessage} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
