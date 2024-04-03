var express = require("express");
const router = express.Router();

const Distributors = require("../models/distributors");
const Fruits = require("../models/fruits");
const Student = require('../models/student');
const Upload = require('../config/common/upload');
const Users = require('../models/users');

//Lab6
const Transporter = require('../config/common/mail');
router.post('/register-send-email', Upload.single('avartar'), async (req, res) => {
  try {
      const data = req.body;
      const { file } = req
      const newUser = Users({
          username: data.username,
          password: data.password,
          email: data.email,
          name: data.name,
          avartar: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
          //url avatar http://localhost:3000/uploads/filename
      })
      const result = await newUser.save()
      if (result) { //Gửi mail
          const mailOptions = {
              from: "thanghtph31577@fpt.edu.vn", //email gửi đi
              to: result.email, // email nhận
              subject: "Đăng ký thành công", //subject
              text: "Cảm ơn bạn đã đăng ký", // nội dung mail
          };
          // Nếu thêm thành công result !null trả về dữ liệu
          await Transporter.sendMail(mailOptions); // gửi mail
          res.json({
              "status": 200,
              "messenger": "Thêm thành công",
              "data": result
          })
      } else {// Nếu thêm không thành công result null, thông báo không thành công
          res.json({
              "status": 400,
              "messenger": "Lỗi, thêm không thành công",
              "data": []
          })
      }
  } catch (error) {
      console.log(error);
  }
})
router.post('/add-fruit-with-file-image', Upload.array('image', 5), async (req, res) => {
  //Upload.array('image',5) => up nhiều file tối đa là 5
  //upload.single('image') => up load 1 file
  try {
      const data = req.body; // Lấy dữ liệu từ body
      const { files } = req //files nếu upload nhiều, file nếu upload 1 file
      const urlsImage =
          files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`)
      //url hình ảnh sẽ được lưu dưới dạng: http://localhost:3000/upload/filename
      const newfruit = new Fruits({
          name: data.name,
          quantity: data.quantity,
          price: data.price,
          status: data.status,
          image: urlsImage, /* Thêm url hình */
          description: data.description,
          id_distributor: data.id_distributor
      }); //Tạo một đối tượng mới
      const result = (await newfruit.save()).populate("id_distributor"); //Thêm vào database
      if (result) {// Nếu thêm thành công result !null trả về dữ liệu
          res.json({
              "status": 200,
              "messenger": "Thêm thành công",
              "data": result
          })
      } else {// Nếu thêm không thành công result null, thông báo không thành công
          res.json({
              "status": 400,
              "messenger": "Lỗi, thêm không thành công",
              "data": []
          })
      }
  } catch (error) {
      console.log(error);
  }
});
router.get('/get-list-fruit', async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  if (!authHeader) {
      return res.sendStatus(401); // Kiểm tra xem header Authorization có tồn tại không
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
      return res.sendStatus(401); // Kiểm tra xem token có tồn tại không
  }

  try {
      const payload = JWT.verify(token, SECRETKEY); // Xác thực token
      console.log(payload);

      const data = await Fruits.find().populate('id_distributor');
      res.json({
          "status": 200,
          "message": 'Danh sách fruit',
          "data": data
      });
  } catch (error) {
      if (error instanceof JWT.TokenExpiredError) {
          return res.sendStatus(401); // Token hết hạn
      } else {
          console.error(error);
          return res.sendStatus(403); // Lỗi xác thực
      }
  }
});
const JWT = require('jsonwebtoken');
const SECRETKEY = "FPTPOLYTECHNIC"
router.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await Users.findOne({ username, password })
      if (user) {
          //Token người dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
          const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
          //Khi token hết hạn, người dùng sẽ call 1 api khác để lấy token mới
          //Lúc này người dùng sẽ truyền refreshToken lên để nhận về 1 cặp token,refreshToken mới
          //Nếu cả 2 token đều hết hạn người dùng sẽ phải thoát app và đăng nhập lại
          const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' })
          //expiresIn thời gian token
          res.json({
              "status": 200,
              "messenger": "Đăng nhâp thành công",
              "data": user,
              "token": token,
              "refreshToken": refreshToken
          })
      } else {
          // Nếu thêm không thành công result null, thông báo không thành công
          res.json({
              "status": 400,
              "messenger": "Lỗi, đăng nhập không thành công",
              "data": []
          })
      }
  } catch (error) {
      console.log(error);
  }
})

router.get('/get-page-fruit', async (req, res) => {
  // Xác thực
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  
  let payload;
  JWT.verify(token, SECRETKEY, (err, _payload) => {
      if (err instanceof JWT.TokenExpiredError)  return res.sendStatus(403)
         if(err) return res.sendStatus(403)
         payload = _payload
  });
  let perPage = 8
let page = req.query.page || 1;
let skip =(perPage * page) - perPage;
let count = await Fruits.find().count();
try {
  const data = await Fruits.find().skip(skip).limit(perPage).populate('id_distributor');
  res.json({
      "status": 200,
      "messenger": "Danh sách fruit",
      "data": {
        "data": data,
        "currentPage": (Number(page)),
        "totalPage": Math.ceil(count / perPage)
      }
  })
} catch (error) {
  console.log(error);
} 
});

router.put('/update-fruit-by-id/:id', Upload.array('image', 5), async (req, res) => {
  try {
      const { id } = req.params
      const data = req.body;
      const { files } = req;



      let url1;
      const updatefruit = await Fruits.findById(id)
      if (files && files.length > 0) {
          url1 = files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

      }
      if (url1 == null) {
          url1 = updatefruit.image;
      }

      let result = null;
      if (updatefruit) {
          updatefruit.name = data.name ?? updatefruit.name,
              updatefruit.quantity = data.quantity ?? updatefruit.quantity,
              updatefruit.price = data.price ?? updatefruit.price,
              updatefruit.status = data.status ?? updatefruit.status,


              updatefruit.image = url1,

              updatefruit.description = data.description ?? updatefruit.description,
              updatefruit.id_distributor = data.id_distributor ?? updatefruit.id_distributor,
              result = (await updatefruit.save()).populate("id_distributor");;
      }
      if (result) {
          res.json({
              'status': 200,
              'messenger': 'Cập nhật thành công',
              'data': result
          })
      } else {
          res.json({
              'status': 400,
              'messenger': 'Cập nhật không thành công',
              'data': []
          })
      }
  } catch (error) {
      console.log(error);
  }
})









//lab 5

router.get('/get-list-distributor', async (req, res) => {
  try {
      const data = await Distributors.find().populate();
      res.json({
          "status": 200,
          "messenger": "Danh sách distributor",
          "data": data
      })
  } catch (error) {
      console.log(error);
  }
})
// Thêm nhà phân phối
router.post('/add-distributor', async (req, res) => {
  try {
    const data = req.body;
    const newDistributor = new Distributors({
      name: data.name
    });
    const result = await newDistributor.save();
    if (result) {
      res.json({
        "status": 200,
        "messenger": "Thêm thành công",
        "data": result
      });
    } else {
      res.json({
        "status": 400,
        "messenger": "Lỗi thêm không thành công",
        "data": []
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Xóa nhà phân phối
router.delete('/destroy-distributor-by-id/:id', async (req, res) => {
  try {
    const distributorId = req.params.id;
    const result = await Distributors.findByIdAndDelete(distributorId);
    if (result) {
      res.json({
        "status": 200,
        "messenger": "Xóa thành công",
        "data": result
      });
    } else {
      res.json({
        "status": 400,
        "messenger": "Lỗi xóa không thành công",
        "data": []
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// Cập nhật thông tin nhà phân phối
router.put('/update-distributor-by-id/:id', async (req, res) => {
  try {
    const distributorId = req.params.id;
    const updateData = req.body;
    const result = await Distributors.findByIdAndUpdate(distributorId, updateData, { new: true });
    if (result) {
      res.json({
        "status": 200,
        "messenger": "Cập nhật thành công",
        "data": result
      });
    } else {
      res.json({
        "status": 400,
        "messenger": "Lỗi cập nhật không thành công",
        "data": []
      });
    }
  } catch (error) {
    console.log(error);
  }
});
//search Distributor
router.get('/search-distributor', async (req, res) => {
  try {
      const key = req.query.key;

      const data = await Distributors.find({ name: { "$regex": key, "$options": "i" } })
          .sort({ createdAt: -1 });

      if (data) {
          res.json({
              "status": 200,
              "messenger": "Thành công",
              "data": data
          });
      } else {
          res.json({
              "status": 400,
              "messenger": "Lỗi, không thành công",
              "data": []
          });
      }
  } catch (error) {
      console.log(error);
  }
});

// Tìm kiếm nhà phân phối





// router.get("/get-list-fruit", async (req, res) => {
//     try {
//       const data = await Fruits.find().populate("id_distributor");
//       res.json({
//         status: 200,
//         messenger: "Danh sách fruit",
//         data: data,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   });
router.post("/add-fruit", async (req, res) => {
  try {
    const data = req.body; // Lấy dữ liệu từ request body
    // Tạo một đối tượng Distributors mới từ dữ liệu trong request body

    const newfruit = new Fruits({
      name: data.name,
      studentId:data.studentId,
      gpa:data.gpa,
      avatarUrl:data.avatarUrl,
      // quantity: data.quantity,
      // price: data.price,
      // status: data.status,
      // image: data.image,
      // description: data.description,
      id_distributor: data.id_distributor
    });
    // Lưu đối tượng Distributors vào cơ sở dữ liệu
    const result = await newfruit.save();
    if (result) {
      res.json({
        status: 200,
        messenger: "Thêm thành công",
        data: result,
      });
    } else {
      res.json({
        status: 200,
        messenger: "Thêm không thành công",
        data: [],
      });
    }
  } catch (error) {
    // Xử lý lỗi nếu có
    console.log(error);
    // Trả về lỗi nếu có lỗi xảy ra
  }
});
router.put("/update-fruit/:id", async (req, res) => {
  try {
    const fruitId = req.params.id;
    const data = req.body;
    const updatedFruit = await Fruits.findByIdAndUpdate(fruitId, data, {
      new: true,
    });
    if (updatedFruit) {
      res.json({
        status: 200,
        messenger: "Cập nhật thành công",
        data: updatedFruit,
      });
    } else {
      res.json({
        status: 404,
        messenger: "Không tìm thấy fruit",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      messenger: "Lỗi server",
      data: null,
    });
  }
});
router.delete("/delete-fruit/:id", async (req, res) => {
  try {
    const fruitId = req.params.id;
    const deletedFruit = await Fruits.findByIdAndDelete(fruitId);
    if (deletedFruit) {
      res.json({
        status: 200,
        messenger: "Xóa thành công",
        data: deletedFruit,
      });
    } else {
      res.json({
        status: 404,
        messenger: "Không tìm thấy fruit",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      messenger: "Lỗi server",
      data: null,
    });
  }
});

router.get("/get-fruit/:id", async (req, res) => {
  try {
    const fruitId = req.params.id;
    const fruit = await Fruits.findById(fruitId).populate("id_distributor");
    if (fruit) {
      res.json({
        status: 200,
        messenger: "Chi tiết fruit",
        data: fruit,
      });
    } else {
      res.json({
        status: 404,
        messenger: "Không tìm thấy fruit",
        data: null,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      messenger: "Lỗi server",
      data: null,
    });
  }
});

router.get("/get-fruits-by-price", async (req, res) => {
  try {
    const { price_start, price_end } = req.query;
    // Chuyển đổi price_start và price_end từ string sang number
    const minPrice = parseFloat(price_start);
    const maxPrice = parseFloat(price_end);

    // Kiểm tra nếu giá trị minPrice hoặc maxPrice không hợp lệ
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({
        status: 400,
        messenger: "Giá trị không hợp lệ",
        data: null,
      });
    }

    // Tìm kiếm các trái cây có giá nằm trong khoảng từ minPrice đến maxPrice
    const fruits = await Fruits.find({
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort({ quantity: -1 })
      .select("name quantity price id_distributor");

    res.json({
      status: 200,
      messenger: "Danh sách fruits",
      data: fruits,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      messenger: "Lỗi server",
      data: null,
    });
  }
});

router.get("/get-fruits-by-name", async (req, res) => {
  try {
    const fruits = await Fruits.find({
      name: { $regex: "^[AX]", $options: "i" },
    }).select("name quantity price id_distributor");
    res.json({
      status: 200,
      messenger: "Danh sách fruits",
      data: fruits,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: 500,
      messenger: "Lỗi server",
      data: null,
    });
  }
});


module.exports = router;


