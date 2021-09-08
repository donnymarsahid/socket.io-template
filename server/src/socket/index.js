// import models
const {chat, user, profile} = require("../../models")

const socketIo = (io) => {

  // create middleware before connection event
  // to prevent client access socket server without token
  io.use((socket, next) => {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      next()
    } else {
      next(new Error("Not Authorized"))
    }
  })

  io.on('connection', (socket) => {
    console.log('client connect: ', socket.id)

    // define listener on event load admin contact
    socket.on("load admin contact", async () => {
      try {
        const adminContact = await user.findOne({
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
          ],
          where: {
            status: "admin"
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        socket.emit("admin contact", adminContact)
      } catch (err) {
        console.log(err)
      }
    });

    // define listener on event load customer contact
    socket.on("load customer contacts", async () => {
      try {
        let customerContacts = await user.findAll({
          include: [
            {
              model: profile,
              as: "profile",
              attributes: {
                exclude: ["createdAt", "updatedAt"],
              },
            },
            {
              model: chat,
              as: "recipientMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
            {
              model: chat,
              as: "senderMessage",
              attributes: {
                exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"],
              },
            },
          ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
          },
        });

        customerContacts = JSON.parse(JSON.stringify(customerContacts))
        customerContacts = customerContacts.map(item => ({
          ...item,
          image: item.profile?.image ? process.env.PATH_FILE + item.profile?.image : null
        }))
        
        socket.emit("customer contacts", customerContacts)
      } catch (err) {
        console.log(err)
      }
    })

    socket.on("disconnect", () => {
      console.log("client disconnect")
    })
  })
}

module.exports = socketIo