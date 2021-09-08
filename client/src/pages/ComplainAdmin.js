// import hook
import React, {useEffect} from 'react'

import NavbarAdmin from '../components/NavbarAdmin'

import {io} from 'socket.io-client'

// init variable here
let socket
export default function ComplainAdmin() {

    const title = "Complain admin"
    document.title = 'DumbMerch | ' + title

    useEffect(() => {
        socket = io("http://localhost:5000", {
            auth: {
                token: localStorage.getItem("token")
            }
        })
        return () => {
            socket.disconnect()
        }

    })
    
    return (
        <>
            <NavbarAdmin title={title} />
        </>
    )
}
