import React, { useState, useEffect } from 'react'

import Navbar from '../components/Navbar'

// import components
import { Container, Row, Col } from 'react-bootstrap'
import Contact from '../components/complain/Contact'

// import socket.io-client 
import {io} from 'socket.io-client'

// initial variable outside socket
let socket
export default function Complain() {
    const [contact, setContact] = useState(null)
    const [contacts, setContacts] = useState([])

    const title = "Complain"
    document.title = 'DumbMerch | ' + title

    useEffect(() =>{
        socket = io('http://localhost:5000', {
            auth: {
                token: localStorage.getItem("token")
            }
        })
        loadContact()

        // listen error event sent from server if client doesn't pass middleware
        socket.on("connect_error", (err) => {
            console.error(err.message)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const loadContact = () => {
        // emit corresponding event to load admin contact
        socket.emit("load admin contact")

        // listen event to get admin contact
        socket.on("admin contact", (data) => {

             // manipulate data to add message property
            const dataContact = {
                ...data, 
                message: "Click here to start message"
            }
            setContacts([dataContact])
        })
    }

    // used for active style when click contact
    const onClickContact = (data) => {
        setContact(data)
    }
    return (
        <>
            <Navbar title={title} />
            <Container fluid style={{height: '89.5vh'}}>
                <Row>
                    <Col md={3} style={{height: '89.5vh'}} className="px-3 border-end border-dark overflow-auto">
                        <Contact dataContact={contacts}  clickContact={onClickContact} contact={contact} />
                    </Col>
                </Row>
            </Container>
        </>
    )
}
