const express = require('express');
const { redirect , render} = require('express/lib/response');
const hbs = require("hbs");
const async = require('hbs/lib/async');
const {postgress ,db }= require('./connection/db.js');
const app = express();
const PORT = 80; 
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',];

app.set('view engine','hbs');
app.use('/public', express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
    res.render('index',{listProject:await postgress('SELECT * from tb_project')});
})

app.get('/project/add', (req, res) => {
  res.render('project');
})

app.post('/project/add', async(req,res)=>{
  const data = req.body;
  await postgress(
  `insert into tb_project(name,start_date,end_date,description,technologi,image)
   values('${data["name"]}','${data["date-start"]}','${data["date-end"]}',
  '${data["content"]}','${typeof data["checkbox[]"] == 'array' ?  data["checkbox[]" ]: "["+data["checkbox[]"]+"]" }','public/asset/image.jpg');`
  );
  res.redirect('/');
})

app.get('/project/delete/:id',async(req,res)=>{
  await postgress(`delete FROM tb_project WHERE id=${req.params.id}`);
  res.redirect('/');
})

app.get('/project/edit/:id',async(req,res)=>{
  const data =await postgress(`SELECT * FROM tb_project WHERE id=${req.params.id}`);
  res.render('project',{edit:data[0]});
})

app.post('/project/update/:id',async(req,res)=>{
const data = req.body;
await postgress(
  `UPDATE tb_project SET name='${data["name"]}',start_date='${data["date_start"]}',end_date='${data["date_end"]}',description='${data["content"]}',
   technologi='${typeof data["checkbox[]"] == 'array' ?  data["checkbox[]" ]: Array.from(data["checkbox[]"]) }',image='public/asset/image.jpg'
   WHERE id=${req.params.id};`
   );
 res.redirect('/');     
});

app.get('/project/:id',async (req,res)=>{
  const data=await postgress(`SELECT * FROM tb_project WHERE id=${req.params.id}`);
  res.render('project-detail',{project:data[0]});
})


app.get('/contact', (req, res) => {
  res.render('contact');
})

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });

hbs.registerHelper('fulltime', function () {
    return getFullTime(this.start_date, this.end_date)
})

hbs.registerHelper('chekbox', function (param) {
 console.log(param);
})

hbs.registerHelper('date',function(time){
  time = new Date(time);
  return `${time.getFullYear()}-${time.getMonth()+1 > 9 ? time.getMonth()+1 :'0'+(time.getMonth()+1)}-${time.getDate()}`; 
});

hbs.registerHelper('tecnologisIcon',function(){
  let a ="";
  JSON.parse(this.technologi).forEach(element => {
    a+=`<li class="${element}"></li>`;
  });
  return a;
});

function difference(date1, date2) {
  date1 = new Date(date1);
  date2 = new Date(date2);
  const date1utc = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const date2utc = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    day = 1000*60*60*24;
    dif =(date2utc - date1utc)/day;
  return dif < 30 ? dif +" hari" : parseInt(dif/30)+" bulan"
}

function getFullTime(dateStart,dateEnd){
  dateStart= new Date(dateStart);
  dateEnd = new Date(dateEnd);
  return `${dateStart.getDate()} ${month[dateStart.getMonth()]} ${dateStart.getFullYear()} - ${dateEnd.getDate()} ${month[dateEnd.getMonth()]} ${dateEnd.getFullYear()}`;
}