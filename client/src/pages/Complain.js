// import hook
import React, { useState, useEffect, useContext } from 'react'

import Navbar from '../components/Navbar'

import { Container, Row, Col } from 'react-bootstrap'
import Contact from '../components/complain/Contact'
import Chat from '../components/complain/Chat'

// import UserContext
import {UserContext} from '../context/userContext'

// import socket.io-client 
import {io} from 'socket.io-client'

// initial variable outside socket
let socket
export default function Complain() {
    const [contact, setContact] = useState(null)
    const [contacts, setContacts] = useState([])
    const [messages, setMessages] = useState([])

    const title = "Complain admin"
    document.title = 'DumbMerch | ' + title

    const [state] = useContext(UserContext)

    useEffect(() =>{
        socket = io('http://localhost:5000', {
            auth: {
                token: localStorage.getItem("token")
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
        loadContact()
        loadMessages()

        return () => {
            socket.disconnect()
        }
    }, [messages]) //  add message to dependencies array to re-render after messages update

    const loadContact = () => {
        // emit event load admin contact
        socket.emit("load admin contact")
        // listen event to get admin contact
        socket.on("admin contact", (data) => {
            // manipulate data to add message property with the newest message
            console.log(data)
            const dataContact = {
                ...data,
                message: messages.length > 0 ? messages[messages.length - 1].message: 'Click here to start message' 
            } 
            setContacts([dataContact])
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
            if (messages.length !== data.length) {
                if (data.length > 0) {
                    const dataMessages = data.map(item => ({
                        idSender: item.sender.id,
                        message: item.message
                    }))
                    setMessages(dataMessages)
                }
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
            <Navbar title={title} />
            <Container fluid style={{height: '89.5vh'}}>
                <Row>
                    <Col md={3} style={{height: '89.5vh'}} className="px-3 border-end border-dark overflow-auto">
                        <Contact dataContact={contacts}  clickContact={onClickContact} contact={contact} />
                    </Col>
                    <Col md={9} style={{maxHeight: '89.5vh'}} className="px-0">
                        <Chat contact={contact} messages={messages} user={state.user} sendMessage={onSendMessage} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
