import sharp from "sharp";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `originals/${id}.jpg`,
    };

    const s3Res = await s3.send(new GetObjectCommand(params));

    const originalBuffer = await s3Res.Body.transformToByteArray();

    const watermark = Buffer.from(
      `<svg width="400" height="100">
         <text x="20" y="60" font-size="40" fill="white" opacity="0.4">
            FOODSANP
         </text>
       </svg>`
    );

    const processed = await sharp(originalBuffer)
      .resize(600)
      .composite([{ input: watermark, gravity: "center" }])
      .jpeg({ quality: 65 })
      .toBuffer();

    return new Response(processed, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch (err) {
    console.log(err);
    return new Response("Processing failed", { status: 500 });
  }
}
