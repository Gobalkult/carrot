var Sprout = require('./../lib')
  , Template = require('../lib/template')
  , chai = require('chai')
  , path = require('path')
  , fs = require('fs')
  , rimraf = require('rimraf')
  , mockery = require('mockery')
  , errno = require('errno');

var fixturesPath = path.join(__dirname, 'fixtures');

chai.should()

describe('sprout',
  function () {

    var fixtures;

    before(
      function () {
        fixtures = path.join(fixturesPath, 'sprout');
      }
    )

    it('should construct with a valid path',
      function (done) {
        var p = path.join(fixtures, 'validPath');
        (function () { return new Sprout(p) })().should.be.ok
        done();
      }
    )

    it('should throw if path doesn\'t exist',
      function (done) {
        var p = path.join(fixtures, 'invalidPath');
        (function () { return new Sprout(p) }).should.throw(p + ' does not exist');
        done();
      }
    )

    it('should throw if path is not a directory',
      function (done) {
        var p = path.join(fixtures, 'notDirectory.foo');
        (function () { return new Sprout(p) }).should.throw(p + ' is not a directory');
        done();
      }
    )

    it('should instantiate all directories as template objects.',
      function (done) {
        var p = path.join(fixtures, 'templates')
          , sprout = new Sprout(p);
        sprout.templates['foo'].should.be.instanceof(Template);
        sprout.templates['bar'].should.be.instanceof(Template);
        done();
      }
    )

    describe('add',
      function () {

        it('should add template',
          function (done) {
            var p = path.join(fixtures, 'add')
              , sprout = new Sprout(p)
              , name = 'foo'
              , src = 'git@github.com:carrot/sprout-sprout';
            sprout.add(name, src).then(
              function (sprout) {
                sprout.templates[name].should.be.instanceof(Template);
                sprout.templates[name].src.should.eq(src);
                fs.existsSync(sprout.templates[name].path).should.be.true;
                rimraf(sprout.templates[name].path, done);
              }
            );
          }
        )

        it('should throw if no name',
          function (done) {
            var p = path.join(fixtures, 'add')
              , sprout = new Sprout(p);
            (function () { sprout.add(null, 'git@github.com:carrot/sprout-sprout') }).should.throw;
            done();
          }
        )

        it('should throw if no src',
          function (done) {
            var p = path.join(fixtures, 'add')
              , sprout = new Sprout(p);
            sprout.add('foo', null).catch(
              function (error) {
                done();
              }
            )
          }
        )

      }
    )

    describe('remove',
      function () {

        it('should remove template',
          function (done) {
            var p = path.join(fixtures, 'remove')
              , sprout = new Sprout(p)
              , name = 'foo'
              , src = 'git@github.com:carrot/sprout-sprout'
              , template;
            sprout.add(name, src).then(
              function (sprout) {
                template = sprout.templates[name];
                template.should.be.instanceof(Template);
                template.src.should.eq(src);
                fs.existsSync(template.path).should.be.true;
                return sprout.remove(name);
              }
            ).then(
              function (sprout) {
                (sprout.templates[name] === undefined).should.be.true;
                fs.existsSync(template.path).should.be.false;
                done();
              }
            );
          }
        )

        it('should throw if no name',
          function (done) {
            var p = path.join(fixtures, 'remove')
              , sprout = new Sprout(p);
            (function () { sprout.remove(null) }).should.throw;
            done();
          }
        )

      }
    )

    describe('update',
      function () {

        it('should update template',
          function (done) {
            var p = path.join(fixtures, 'update')
              , sprout = new Sprout(p)
              , name = 'foo'
              , src = 'git@github.com:carrot/sprout-sprout';
            sprout.add(name, src).then(
              function (sprout) {
                template = sprout.templates[name];
                template.should.be.instanceof(Template);
                template.src.should.eq(src);
                fs.existsSync(template.path).should.be.true;
                return sprout.update(name);
              }
            ).then(
              function (sprout) {
                rimraf(sprout.templates[name].path, done);
              }
            )
          }
        )

        it('should throw if no name',
          function (done) {
            var p = path.join(fixtures, 'update')
              , sprout = new Sprout(p);
            (function () { sprout.update(null) }).should.throw;
            done();
          }
        )

      }
    )

    describe('init',
      function () {

        it('should init template',
          function (done) {
            var p = path.join(fixtures, 'init')
              , sprout = new Sprout(p)
              , name = 'foo'
              , src = 'git@github.com:carrot/sprout-sprout'
              , target = path.join(p, 'bar');
            sprout.add(name, src).then(
              function (sprout) {
                template = sprout.templates[name];
                template.should.be.instanceof(Template);
                template.src.should.eq(src);
                fs.existsSync(template.path).should.be.true;
                return sprout.init(name, target, {
                  locals: {
                    name: 'bar',
                    description: 'foo',
                    github_username: 'carrot'
                  }
                });
              }
            ).then(
              function (sprout) {
                fs.existsSync(target).should.be.true;
                rimraf(sprout.templates[name].path,
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should throw if no name',
          function (done) {
            var p = path.join(fixtures, 'init')
              , sprout = new Sprout(p);
            (function () { sprout.init(null) }).should.throw;
            done();
          }
        )

        it('should throw if no target',
          function (done) {
            var p = path.join(fixtures, 'init')
              , sprout = new Sprout(p)
              , name = 'foo'
              , src = 'git@github.com:carrot/sprout-sprout';
            sprout.add(name, src).then(
              function (sprout) {
                template = sprout.templates[name];
                template.should.be.instanceof(Template);
                template.src.should.eq(src);
                fs.existsSync(template.path).should.be.true;
                return sprout.init(name, null, {
                  locals: {
                    name: 'bar',
                    description: 'foo',
                    github_username: 'carrot'
                  }
                });
              }
            ).catch(
              function () {
                rimraf(sprout.templates[name].path, done);
              }
            );
          }
        )

      }
    )

  }
)

describe('template',
  function () {

    var describeFixturesPath
      , describeTargetPath
      , describeSprout;

    before(
      function () {
        describeFixturesPath = path.join(fixturesPath, 'template');
        describeTargetPath = path.join(describeFixturesPath, '.target');
        describeSprout = new Sprout(path.join(describeFixturesPath, '.sprout'));
      }
    )

    it('should construct with a valid name and path',
      function (done) {
        var src = path.join(describeFixturesPath, 'validNameAndPath')
          , name = 'validNamePath';
        (function () { return new Template(describeSprout, name, src) })().should.be.ok
        done();
      }
    )

    it('should throw without a valid name',
      function (done) {
        var src = path.join(describeFixturesPath, 'invalidName');
        (function () { new Template(describeSprout, null, src) }).should.throw
        done();
      }
    )

    it('should determine that src is remote',
      function (done) {
        var src = 'git@github.com:carrot/sprout-sprout'
          , name = 'srcRemote'
          , template = new Template(describeSprout, 'foo', src);
        template.isRemote.should.be.true;
        done();
      }
    )

    it('should determine that src is local',
      function (done) {
        var src = path.join(describeFixturesPath, 'isLocal')
          , name = 'isLocal'
          , template = new Template(describeSprout, name, src);
        template.isRemote.should.be.false;
        done();
      }
    )

    describe('save',
      function () {

        it('should save a template',
          function (done) {
            var src = 'git@github.com:carrot/sprout-sprout'
              , name = 'isRemote'
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                rimraf(template.path, done);
              }
            )
          }
        )

        it('should throw if template has no src',
          function (done) {
            var name = 'noSrc'
              , template = new Template(describeSprout, name, null);
            return template.save().catch(
              function (error) {
                error.toString().should.eq('Error: no source provided');
                done();
              }
            )
          }
        )

        it('should throw if src is remote and there is no internet',
          function (done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});
            mockery.registerMock('dns', {resolve:
              function (name, callback) {
                return callback(errno.code.ECONNREFUSED);
              }
            })
            var src = 'git@github.com:carrot/sprout-sprout'
              , name = 'noInternet'
              , template = new (require('./../lib/template'))(describeSprout, name, src);
            return template.save().catch(
              function (error) {
                error.toString().should.eq('Error: make sure that you are connected to the internet!');
                mockery.deregisterMock('dns');
                mockery.disable();
                done();
              }
            )
          }
        )

        it('should throw if src is local and doesn\'t exist',
          function (done) {
            var src = path.join(describeFixturesPath, 'localDoesntExist')
              , name = 'localDoesntExist'
              , template = new Template(describeSprout, name, src);
            return template.save().catch(
              function (error) {
                error.toString().should.eq('Error: there is no sprout template located at ' + src);
                done();
              }
            )
          }
        )

      }
    )

    describe('init',
      function () {

        it('should init template',
          function (done) {
            var name = 'init'
              , src = 'git@github.com:carrot/sprout-sprout'
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target, {
                  locals: {
                    name: 'bar',
                    description: 'foo',
                    github_username: 'carrot'
                  }
                });
              }
            ).then(
              function (template) {
                fs.existsSync(target).should.be.true;
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should throw when no target provided',
          function (done) {
            var name = 'noTarget'
              , src = 'git@github.com:carrot/sprout-sprout'
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(null);
              }
            ).catch(
              function (error) {
                error.toString().should.eq('Error: target path required');
                return template.remove().then(
                  function () {
                    done();
                  }
                );
              }
            )
          }
        )

        it('should throw when no init.js or init.coffee provided',
          function (done) {
            var name = 'noInit'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).catch(
              function (error) {
                error.toString().should.eq('Error: neither init.coffee nor init.js exist.');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should use init.js',
          function (done) {
            var name = 'initJs'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).then(
              function (template) {
                fs.readFileSync(path.join(target, 'foo'), 'utf8').should.eq('bar\n');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should use init.coffee',
          function (done) {
            var name = 'initCoffee'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).then(
              function (template) {
                fs.readFileSync(path.join(target, 'foo'), 'utf8').should.eq('bar\n');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should run before hook',
          function (done) {
            var name = 'before'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).then(
              function (template) {
                fs.readFileSync(path.join(target, 'bar'), 'utf8').should.eq('foo\n');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should run beforeRender hook',
          function (done) {
            var name = 'beforeRender'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).then(
              function (template) {
                fs.readFileSync(path.join(target, 'foo'), 'utf8').should.eq('foo\n');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should run after hook',
          function (done) {
            var name = 'after'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).then(
              function (template) {
                fs.readFileSync(path.join(target, 'bar'), 'utf8').should.eq('foo\n');
                return template.remove().then(
                  function () {
                    rimraf(target, done);
                  }
                );
              }
            )
          }
        )

        it('should remove target directory if error thrown after target directory created',
          function (done) {
            var name = 'removeTarget'
              , src = path.join(describeFixturesPath, name)
              , target = path.join(describeTargetPath, name)
              , template = new Template(describeSprout, name, src);
            return template.save().then(
              function (template) {
                fs.existsSync(template.path).should.be.true;
                return template.init(target);
              }
            ).catch(
              function (error) {
                fs.existsSync(target).should.be.false;
                done();
              }
            )
          }
        )

      }
    )

  }
)
