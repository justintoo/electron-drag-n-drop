import React from "react";
import Header from "Header";

const fs = require("fs");
const path = require("path");
const shell = require("shelljs/global");

const Drop = React.createClass({
  getInitialState() {
    return {
      'port': '',
      'ip': ''
    };
  },

  componentDidMount() {
    const target = document.getElementById('drop');
    const ipPath = path.join(__dirname, 'get_ip.sh')

    const ip = exec(`./${ipPath}`, {async: true});

    ip.stdout.on('data', (data) => {
      const ip = data.trim();

      this.setState({'ip': ip});
    });

    target.ondragover = function () {
      return false;
    };

    target.ondragleave = target.ondragend = function () {
      return false;
    };

    target.ondrop = (e) => {
      e.preventDefault();
      this.parseForBuild(e.dataTransfer.files[0].path);
    };
  },

  parseForBuild(filePath) {
    const files = fs.readdirSync(filePath);

    files.filter((x) => {
      const fullPath = filePath + '/' + x;
      const name = path.basename(fullPath, '.js');

      return (name === 'gulpfile');
    })
    .forEach((e) => {
        cd(filePath);
        const child = exec('gulp', {async:true});

        child.stdout.on('data', (data) => {
          const local = data.match(/localhost:\d{4}/);

          if (local && this.state.port === '') {
            const port = local[0].split(':')[1];
            this.setState({'port': `:${port}`});
          }
        });
    });
  },

  render() {
    return (
      <span>
        <Header ip={this.state.ip} port={this.state.port}/>
        <div id="drop">
          <svg viewBox="0 0 34 46">
            <g class="arrow" fill="none" transform="translate(1, 1)" stroke="#FFA800" stroke-width="2">
              <path d="M16,0 L16,42" stroke-linecap="square" />
              <path d="M0,26 L15.9023353,43 L32,26" />
            </g>
          </svg>
        </div>
      </span>
    );
  }
});

export default Drop;