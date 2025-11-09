import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);
const { assert } = chai;

suite('Functional Tests', function() {

  test('Viewing one stock: GET /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        done();
      });
  });

  test('Viewing one stock and liking it: GET /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing the same stock and liking it again (ensure likes are not double-counted)', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  test('Viewing two stocks: GET /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'stock');
        assert.property(res.body.stockData[0], 'price');
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'stock');
        assert.property(res.body.stockData[1], 'price');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

  test('Viewing two stocks and liking them: GET /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.property(res.body.stockData[1], 'rel_likes');
        done();
      });
  });

});
