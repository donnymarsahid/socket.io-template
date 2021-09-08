// import hook
import React, {useEffect} from 'react'

import Navbar from '../components/Navbar'

import {io} from 'socket.io-client'

// init variable here
let socket
export default function Complain() {

    const title = "Complain"
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
            <Navbar title={title} />
        </>
    )
}
