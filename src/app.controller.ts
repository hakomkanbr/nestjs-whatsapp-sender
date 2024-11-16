import { Body, Controller, Get, Post, StreamableFile, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBody, ApiConsumes, ApiProperty } from '@nestjs/swagger';
import * as fs from 'fs'
import { join } from 'path';
import axios from 'axios';
import { createCanvas, loadImage } from "canvas"
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

function base64_encode(file) {
  // read binary data
  // convert binary data to base64 encoded string
  return new Buffer(file).toString('base64');
}


export class WhatsappSenderDto {
  @ApiProperty({
    default: "fbe2c9e614f1157fc94e1098100c032ecb2ef94887005cd3f114f75a71de15677bc64255c1cbea82"
  })
  token: string;
  @ApiProperty({
    default: "+905382015072"
  })
  phoneNumber: string;
  @ApiProperty({
    default: "جزاكم الله خيرا"
  })
  message: string = "جزاكم الله خيرا";
  @ApiProperty({
    default: "https://whatsapp.bremix.tech/template.jpg"
  })
  url: string;
  // @ApiProperty({
  //   default: "أحمد الحسن"
  // })
  // name: string;
  // @ApiProperty({ type: 'string', format: 'binary', required: true })
  // file: Express.Multer.File
}
export class DrawImageDto {
  @ApiProperty({
    default: "أحمد الحسن"
  })
  name: string;
  // @ApiProperty({ type: 'string', format: 'binary', required: true })
  // file: Express.Multer.File;
  @ApiProperty({
    default: "+905382015072"
  })
  phoneNumber: string;
}

const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    cb(null, fileName);
  },
});


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("testPath")
  async testPath() {
    var save = join(__dirname, "../", "uploads", `template.jpg`);
    return save;
  }

  @Post("drawImage")
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  )
  async drawImage(@Body() data: DrawImageDto, /*@UploadedFile() file: Express.Multer.File*/) {
    var filepath = join(__dirname, "../", "uploads", `template.jpg`);
    const image = await loadImage(filepath);
    // إنشاء canvas بنفس حجم الصورة
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    const text = data.name;
    const fontSize = 180; // حجم الخط
    ctx.font = `${fontSize}px Arial`; // تحديد الخط
    ctx.fillStyle = 'black'; // تحديد لون النص
    // رسم الصورة على الـ canvas
    ctx.drawImage(image, 0, 0);
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    // حساب موقع النص ليكون في وسط الصورة
    const x = (image.width - textWidth) / 2;
    const y = (image.height + textHeight) / 2;
    // حساب أبعاد النص
    ctx.fillText(text, x, y - 200); // تحديد النص ومكانه

    const imageName = `${data.phoneNumber}.png`;
    var save = join(__dirname, "../", "uploads", imageName);
    console.info("__dirname => ", save);
    // حفظ الصورة الجديدة مع النص
    const output = fs.createWriteStream(save);
    const stream = canvas.createJPEGStream();
    stream.pipe(output);
    return imageName;
  }

  @Post("send_message")
  async sendMessage(@Body() data: WhatsappSenderDto) {
    var url = `${data.url}`;
    console.info("url => " , url);
    const options = {
      method: 'POST',
      url: 'https://api.wassenger.com/v1/messages',
      headers: { 'Content-Type': 'application/json', Token: data.token },
      data: {
        phone: data.phoneNumber,
        message: data.message,
        media: {
          url: url,
          expiration: '7d',
          viewOnce: false
        }
      }
    };
    const res = await axios.request(options);
    if (res.status == 200 || res.status == 201) {
      return true;
    }
    return false;
  }

  @Get("File")
  getFile(): string {
    const image = fs.readFileSync(join(process.cwd(), "uploads" , 'template.jpg')); 
    const imageBase64 = new Buffer(image).toString('base64') 
    return `data:image/png;base64,${imageBase64}`;
  }
}
