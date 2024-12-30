// const express = require('express');
// const router = express.Router();
// const Message = require('../database/models/Message');
// const Sequelize = require('sequelize'); 
// const { authenticate } = require('../middleware/auth'); 

// router.get('/connections', authenticate, async (req, res) => {
//   try {
//     const connections = await Connection.findAll({
//       where: { userId: req.user.id },
//       include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'profile_pic', 'status'] }],
//     });
//     return res.json({ connections });
//   } catch (err) {
//     console.error("Error fetching connections:", err);
//     return res.status(500).json({ error: "Failed to fetch connections" });
//   }
// });

// router.post('/messages/send', authenticate, async (req, res) => {
//   const { receiver_id, content } = req.body;
//   const sender_id = req.user.id;

//   if (!receiver_id || !content) {
//     return res.status(400).json({ error: 'Receiver ID and content are required' });
//   }

//   try {
//     const message = await Message.create({
//       sender_id,
//       receiver_id,
//       content,
//     });

//     return res.status(201).json({ message: "Message sent!", data: message });
//   } catch (err) {
//     console.error("Error sending message:", err);
//     return res.status(500).json({ error: "Failed to send message" });
//   }
// });

// router.get('/conversation/:userId', authenticate, async (req, res) => {
//   const sender_id = req.user.id;
//   const receiver_id = parseInt(req.params.userId, 10);

//   if (!receiver_id) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     const messages = await Message.findAll({
//       where: {
//         [Sequelize.Op.or]: [
//           { sender_id, receiver_id },
//           { sender_id: receiver_id, receiver_id: sender_id }, 
//         ],
//       },
//       order: [['created_at', 'ASC']],  
//     });
    
//     return res.status(200).json({ data: messages });
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     return res.status(500).json({ error: "Failed to fetch messages" });
//   }
// });

// module.exports = router;































const express = require('express');
const router = express.Router();
const Message = require('../database/models/Message');
const Sequelize = require('sequelize'); 
const { authenticate } = require('../middleware/auth'); 

router.get('/connections', authenticate, async (req, res) => {
  try {
    const connections = await Connection.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'profile_pic', 'status'] }],
    });
    return res.json({ connections });
  } catch (err) {
    console.error("Error fetching connections:", err);
    return res.status(500).json({ error: "Failed to fetch connections" });
  }
});

router.post('/messages/send', authenticate, async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  if (!receiver_id || !content) {
    return res.status(400).json({ error: 'Receiver ID and content are required' });
  }

  try {
    const message = await Message.create({
      sender_id,
      receiver_id,
      content,
    });

    return res.status(201).json({ message: "Message sent!", data: message });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

router.get('/conversation/:userId', authenticate, async (req, res) => {
  const sender_id = req.user.id;
  const receiver_id = parseInt(req.params.userId, 10);

  if (!receiver_id) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const messages = await Message.findAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id, receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id }, 
        ],
      },
      order: [['created_at', 'ASC']],  
    });
    
    return res.status(200).json({ data: messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;