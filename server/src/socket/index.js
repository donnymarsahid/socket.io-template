// import models here
const {user, chat} = require('../../models')

const socketIo = (io) => {
  io.on('connection', (socket) => {
    console.log('client connect: ', socket.id)

    socket.on("load admin contact", async() => {
      try {
        const adminContact = await user.findOne({
          where: {
            status: "admin"
          },
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"]
          }
        })

        socket.emit("admin contact", adminContact)
      } catch (error) {
        console.log(error)
      }
    })

    socket.on("load customer contacts", async() => {
      try {
        let customerContacts = await user.findAll({
          include: [{
            model: chat,
            as: "recipientMessage",
            attributes: {
              exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"]
            }
          },
          {
            model: chat,
            as: "senderMessage",
            attributes: {
              exclude: ["createdAt", "updatedAt", "idRecipient", "idSender"]
            }
          },
        ],
          attributes: {
            exclude: ["createdAt", "updatedAt", "password"]
          }
        })

        customerContacts = customerContacts.map(item => ({
          ...item,
          profile: {
            ...item.profile,
            image: item.profile?.image ? process.env.PATH_FILE + item.profile?.image : null
          }
        }))

        socket.emit("customer contacts", customerContacts)
      } catch (error) {
        console.log(error)
      }
    })
    socket.on("disconnect", () => {
      console.log("client disconnect")
    })
  })
}

module.exports = socketIo