import { XMLParser } from 'fast-xml-parser'
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from 'uuid';

const parser = new XMLParser({
  ignoreAttributes: false
})
const client = new S3Client({
  region: 'eu-west-2'
})

export const lambdaHandler = async (event, context) => {
  // get most interesting flickr images from yesterday
  let date = new Date()
  date.setDate(date.getDate() - 1)
  date = date.toLocaleDateString('en-CA')
  const res = await fetch(`https://api.flickr.com/services/rest?method=flickr.interestingness.getList&date=${date}&api_key=${process.env.FLICKR_API_KEY}`)
  const xml = await res.text()
  const json = parser.parse(xml)
  const photos = json.rsp.photos.photo.map(photo => ({
    url: `https://live.staticflickr.com/${photo['@_server']}/${photo['@_id']}_${photo['@_secret']}.jpg`,
    title: photo['@_title']
  })).slice(0, 5)

  await Promise.all(photos.map(async ({url, title}) => {
    const res = await fetch(url)

    const upload = new Upload({
      client,
      params: {
        Bucket: 'flickr-550e8400-e29b-41d4-a716-446655440000',
        Key: `${date}/${title}-${uuidv4()}.jpg`,
        Body: res.body,
      }
    })

    await upload.done()
  }))

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `uploaded most interesting flickr images to bucket for ${date} to bucket successfull`,
    })
  };

  return response;
};
