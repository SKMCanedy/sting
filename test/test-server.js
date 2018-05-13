const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require ('../server.js');
const expect = chai.expect;
const baseUrl = 'http://localhost:8080';

chai.use(chaiHttp);

describe ('serverTest', function(){
    it('should return status 200', function(){
        chai.request(baseUrl)
          .get('/')
          .then(function(res){
            expect(res).to.have.status(200);
            expect(res).to.be.html;
          })
    });
})