const http = require('http');

const postData = JSON.stringify({
  name: '羽毛球场C',
  location: '体育馆三楼',
  operator_id: 388
});

const options = {
  hostname: 'localhost',
  port: 7001,
  path: '/api/venues',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`响应体: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('请求结束');
  });
});

req.on('error', (e) => {
  console.error(`请求遇到问题: ${e.message}`);
});

req.write(postData);
req.end();
