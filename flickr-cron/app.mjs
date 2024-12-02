import { XMLParser } from 'fast-xml-parser'


export const lambdaHandler = async (event, context) => {
  const parser = new XMLParser({
    ignoreAttributes: false
  })
  const res = await fetch(`https://api.flickr.com/services/rest?method=flickr.interestingness.getList&api_key=${process.env.FLICKR_API_KEY}`)
  const xml = await res.text()
  const json = parser.parse(xml)
  const photos = json.rsp.photos.photo
  console.log(JSON.stringify(json, null, 2))
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    })
  };

  return response;
};
