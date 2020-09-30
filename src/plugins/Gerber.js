const fs = require("fs");
const { createSVGWindow } = require("svgdom");
const window = createSVGWindow();
const SVG = require("svg.js")(window);

class Board {
  constructor(file, { max_height = 500, verbose = false }) {
    this.width = false;
    this.max_height = max_height;
    this.verbose = verbose;
    this.temp_path = "./temp_gerber_files";

    if (!fs.existsSync(this.temp_path)) fs.mkdirSync(this.temp_path);

    if (file.substring(file.length - 3).toUpperCase() == "ZIP")
      this.extract_files(file);
    else this.copy_files(file);

    this.identify_files();
  }

  render(output, { silk = true }) {
    this.silk_bool = silk;
    //setup output path
    this.output_folder = output;
    if (this.output_folder[this.output_folder.length - 1] == "/")
      this.output_folder = this.output_folder.substring(
        0,
        this.output_folder.length - 1
      );
    if (!fs.existsSync(this.output_folder)) fs.mkdirSync(this.output_folder);
    this.output_folder += "/";

    // render top
    if (
      this.files["drill"] &&
      this.files["outline"] &&
      this.files["top_copper"] &&
      this.files["top_mask"]
    ) {
      if (this.verbose) console.log("Rendring Top");
      this.draw_svg("top", "top.svg");
    } else {
      console.log("No Top Files");
    }

    // render bottom
    if (
      this.files["drill"] &&
      this.files["outline"] &&
      this.files["bottom_copper"] &&
      this.files["bottom_mask"]
    ) {
      if (this.verbose) console.log("Rendring Top");
      this.draw_svg("bottom", "bottom.svg");
    } else {
      console.log("No Top Files");
    }
  }

  draw_svg(layer, filename) {
    if (!this.width) {
      this.set_dimensions();
      this.scale = this.max_height / this.height;
    }

    //initialize svg
    const document = window.document;
    this.drawing = SVG(document.documentElement);

    // draw background rectangle
    this.drawing
      .rect(this.width * this.scale, this.height * this.scale)
      .fill("#f0e6aa");

    if (this.verbose) console.log("Milling Outline");
    this.init_file(this.files["outline"]);
    this.draw_macros(this.files["outline"], "green");

    if (this.verbose) console.log("Etching Copper");
    this.init_file(this.files[layer + "_copper"]);
    this.draw_macros(this.files[layer + "_copper"], "darkgreen");

    if (this.files[layer + "_silk"] && this.silk_bool) {
      if (this.verbose) console.log("Curing Silk Screen");
      this.init_file(this.files[layer + "_silk"]);
      this.draw_macros(this.files[layer + "_silk"], "white");
    }

    if (this.verbose) console.log("Applying Solder Mask");
    this.init_file(this.files[layer + "_mask"]);
    this.draw_macros(this.files[layer + "_mask"], "grey");

    // draw drill holes
    if (this.verbose) console.log("Drilling Holes");
    this.drill_holes();

    // save svg
    fs.writeFileSync(this.output_folder + filename, this.drawing.svg());
  }

  draw_macros(file, color) {
    this.aperture_locs.forEach((macro) => {
      if (file == this.files["outline"])
        this.polygon_fill(file.substring(macro[1], macro[2]), color);
      else
        this.draw_section(file.substring(macro[1], macro[2]), macro[0], color);
    });
  }

  draw_section(g_code, a_id, color) {
    const radius = parseFloat(this.apertures[a_id][1]);
    const shape = this.apertures[a_id][0];
    var g_loc = 0;
    var x_loc = 0;
    // indexOf all coords && draw path
    var path = "";
    g_loc = g_code.indexOf("G");

    // case where no g code is present for first move
    x_loc = g_code.indexOf("X");
    if (x_loc < g_loc || g_loc == -1) {
      g_code = "G01*" + g_code.substring(x_loc);
      g_loc = 0;
    }

    while (g_loc != -1) {
      var code = g_code.substring(g_loc, g_loc + 3);
      var next_code = "";
      if (code == "G36") {
        next_code = g_code.indexOf("G37", g_loc);
        this.polygon_fill(g_code.substring(g_loc, next_code), color);
        g_loc = g_code.indexOf("G", next_code + 1);
      } else {
        next_code = g_code.indexOf("G", g_loc + 1);
        x_loc = g_code.indexOf("X", g_loc + 1);
        while (
          (x_loc < next_code && x_loc != -1) ||
          (next_code == -1 && x_loc != -1)
        ) {
          var y_loc = g_code.indexOf("Y", x_loc);
          if (code == "G01") {
            var x =
              (Math.abs(parseFloat(g_code.substring(x_loc + 1, y_loc))) /
                this.x_decimals -
                this.min_x) *
              this.scale;
            var y =
              (Math.abs(
                parseFloat(
                  g_code.substring(y_loc + 1, g_code.indexOf("D", y_loc))
                )
              ) /
                this.y_decimals -
                this.min_y) *
              this.scale;
            var d_code = g_code.substring(
              g_code.indexOf("D", x_loc),
              g_code.indexOf("D", x_loc) + 3
            );
            if (d_code == "D02" || path == "") {
              path += "M" + x + "," + y;
              if (
                g_code.indexOf(
                  "D01",
                  y_loc,
                  g_code.indexOf("D02", g_code.indexOf("D", x_loc) + 3)
                ) != -1 &&
                shape == "C"
              )
                this.drawing
                  .circle(radius * 2)
                  .center(x, y)
                  .fill(color);
            } else if (d_code == "D01") path += "L" + x + "," + y;
            if (d_code == "D01" || d_code == "D03") {
              if (shape == "C")
                this.drawing
                  .circle(radius * 2)
                  .center(x, y)
                  .fill(color);
              else if (shape == "O")
                this.drawing
                  .ellipse(
                    parseFloat(this.apertures[a_id][1]),
                    parseFloat(this.apertures[a_id][2])
                  )
                  .center(x, y)
                  .fill(color);
              else if (shape == "R") {
                var width = parseFloat(this.apertures[a_id][1]);
                var height = parseFloat(this.apertures[a_id][2]);
                this.drawing
                  .rect(width, height)
                  .move(parseFloat(x) - width / 2, parseFloat(y) - height / 2)
                  .fill(color);
              } else console.log(shape);
            }
          } else if (code == "G02" || code == "G03") {
            var sweep_flag = "1";
            if (code == "G02") sweep_flag = "0";
            path += this.draw_arc(
              g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
              sweep_flag,
              [x, y]
            );
          } else console.log(code);
          x_loc = g_code.indexOf("X", x_loc + 1);
        }
        g_loc = next_code;
      }
    }

    this.drawing
      .path(path)
      .stroke({ color: color, width: radius * 2 })
      .fill("none");
  }

  draw_arc(g_code, sweep_flag, start_pos, multiquadrant_bool = true) {
    var y_loc = g_code.indexOf("Y");
    var i_loc = g_code.indexOf("I");
    var d_loc = g_code.indexOf("D");
    var x =
      (Math.abs(parseFloat(g_code.substring(4, y_loc))) / this.x_decimals -
        this.min_x) *
      this.scale;
    var i = 0;
    var j = 0;

    if (g_code.indexOf("J") != -1) {
      j =
        (parseFloat(g_code.substring(g_code.indexOf("J") + 1, d_loc)) /
          this.y_decimals) *
        this.scale;
      d_loc = g_code.indexOf("J");
    }
    var y;
    if (i_loc != -1) {
      y =
        (Math.abs(parseFloat(g_code.substring(y_loc + 1, i_loc))) /
          this.y_decimals -
          this.min_y) *
        this.scale;
      i =
        (parseFloat(g_code.substring(g_code.indexOf("I") + 1, d_loc)) /
          this.x_decimals) *
        this.scale;
    } else
      y =
        (Math.abs(parseFloat(g_code.substring(y_loc + 1, d_loc))) /
          this.y_decimals -
          this.min_y) *
        this.scale;

    var center = [parseFloat(start_pos[0]) + i, parseFloat(start_pos[1]) + j];

    var start_angle = this.find_angle(start_pos, center);
    var end_angle = this.find_angle([x, y], center);
    var angle;
    if (sweep_flag == "0") angle = start_angle - end_angle;
    else angle = end_angle - start_angle;

    if (!multiquadrant_bool && angle > 0.5) {
      if (sweep_flag == "0") angle = end_angle - start_angle;
      else angle = start_angle - end_angle;
    }
    var large_arc_flag = 0;
    if (angle >= 1) large_arc_flag = 1;

    var radius = Math.sqrt(i ** 2 + j ** 2);

    return (
      "A " +
      radius +
      " " +
      radius +
      " 0 " +
      large_arc_flag +
      " " +
      sweep_flag +
      " " +
      x +
      " " +
      y
    );
  }

  find_angle(pos, center) {
    var y = parseFloat(pos[1]) - parseFloat(center[1]);
    var x = parseFloat(pos[0]) - parseFloat(center[0]);
    var angle = Math.atan2(y, x);
    angle /= Math.PI;
    if (angle < 0) angle += 2;
    return angle;
  }

  polygon_fill(g_code, color) {
    var g_loc = 0;
    var x_loc = 0;
    // indexOf all coords and draw path
    var path = "";

    g_loc = g_code.indexOf("G");
    // case where no g code is present for first move
    x_loc = g_code.indexOf("X");
    if (x_loc < g_loc || g_loc == -1) {
      g_code = "G01*" + g_code.substring(x_loc);
      g_loc = 0;
    }
    while (g_loc != -1) {
      var code = g_code.substring(g_loc, g_loc + 3);
      var next_code = g_code.indexOf("G", g_loc + 1);
      x_loc = g_code.indexOf("X", g_loc + 1);
      while (
        (x_loc < next_code && x_loc != -1) ||
        (next_code == -1 && x_loc != -1)
      ) {
        var y_loc = g_code.indexOf("Y", x_loc);
        if (code == "G01") {
          var x =
            (Math.abs(parseFloat(g_code.substring(x_loc + 1, y_loc))) /
              this.x_decimals -
              this.min_x) *
            this.scale;
          var y =
            (Math.abs(
              parseFloat(
                g_code.substring(y_loc + 1, g_code.indexOf("D", y_loc))
              )
            ) /
              this.y_decimals -
              this.min_y) *
            this.scale;
          if (
            g_code.substring(
              g_code.indexOf("D", x_loc),
              g_code.indexOf("D", x_loc) + 3
            ) == "D02" ||
            path == ""
          )
            path += "M" + x + "," + y;
          else if (
            g_code.substring(
              g_code.indexOf("D", x_loc),
              g_code.indexOf("D", x_loc) + 3
            ) == "D01"
          );
          path += "L" + x + "," + y;
        } else if (code == "G02" || code == "G03") {
          var sweep_flag = "1";
          if (code == "G02") sweep_flag = "0";
          path += this.draw_arc(
            g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
            sweep_flag,
            [x, y]
          );
        }
        x_loc = g_code.indexOf("X", x_loc + 1);
      }
      g_loc = next_code;
    }
    path += " Z";
    this.drawing
      .path(path)
      .stroke("none")
      .fill(color);
  }

  drill_holes() {
    var tool_num = 1;
    var leading_zero = true;
    var diameter = 0;
    while (
      diameter != -1 &&
      this.files["drill"].indexOf("T" + tool_num + "C") != -1
    ) {
      // get diameter index of current tool
      diameter = this.files["drill"].indexOf("T0" + tool_num + "C");

      if (
        diameter == -1 &&
        this.files["drill"].indexOf("T" + tool_num + "C") == -1
      )
        break;
      else {
        if (diameter == -1) {
          leading_zero = false;
          diameter = this.files["drill"].indexOf("T" + tool_num + "C");
        }
        // draw all holes for current tool
        var curr_holes =
          this.files["drill"].indexOf(
            "T" + (leading_zero ? "0" : "") + tool_num,
            diameter + 4
          ) + 3;
        // get diameter of current tool
        var d_len = 0;
        var increment = leading_zero ? 4 : 3;

        while (
          !isNaN(
            this.files["drill"].substring(
              diameter + increment,
              diameter + increment + d_len
            )
          )
        ) {
          d_len += 1;
        }

        diameter = parseFloat(
          this.files["drill"].substring(
            diameter + increment,
            diameter + increment + d_len
          )
        );

        var next_tool = this.files["drill"].indexOf(
          "T" + (leading_zero ? "0" : "") + (tool_num + 1),
          curr_holes
        );
        var curr_x = this.files["drill"].indexOf("X", curr_holes);
        var curr_y = this.files["drill"].indexOf("Y", curr_x);

        // indexOf and draw circles at hole coords
        while (curr_x < next_tool || (next_tool == -1 && curr_x != -1)) {
          var y_len = 1;
          if (
            this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len) ==
              "+" ||
            this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len) == "-"
          )
            curr_y++;
          while (
            !isNaN(
              this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len)
            )
          )
            y_len += 1;
          var hole_x =
            Math.abs(
              parseFloat(this.files["drill"].substring(curr_x + 1, curr_y)) -
                this.min_x
            ) /
            (this.files["drill"].substring(curr_x + 1, curr_y).indexOf(".") ==
            -1
              ? this.x_decimals
              : 1);
          var hole_y =
            Math.abs(
              parseFloat(
                this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len)
              ) - this.min_y
            ) /
            (this.files["drill"]
              .substring(curr_y + 1, curr_y + 1 + y_len)
              .indexOf(".") == -1
              ? this.y_decimals
              : 1);
          this.drawing
            .circle(diameter * this.scale)
            .center(hole_x * this.scale, hole_y * this.scale)
            .fill("black");
          curr_x = this.files["drill"].indexOf("X", curr_y);
          curr_y = this.files["drill"].indexOf("Y", curr_x);
        }
        tool_num += 1;
      }
    }
  }

  set_dimensions() {
    const file = this.files["outline"];
    this.set_decimal_places(file);
    this.width = 0;
    this.height = 0;
    this.min_x = 9999999;
    this.min_y = 9999999;
    var pointer = file.indexOf("D10");
    pointer = file.indexOf("X", pointer);
    while (pointer != -1) {
      var y = file.indexOf("Y", pointer + 1);
      var temp = Math.abs(file.substring(pointer + 1, y)) / this.x_decimals;
      if (temp > this.width) this.width = temp;
      if (temp < this.min_x) this.min_x = temp;

      pointer = file.indexOf("D", y + 1);
      if (file.substring(y + 1, pointer).indexOf("I") != -1)
        pointer = file.indexOf("I", y + 1, pointer);
      if (file.substring(y + 1, pointer).indexOf("J") != -1)
        pointer = file.indexOf("J", y + 1, pointer);
      temp = file.substring(y + 1, pointer);
      temp = Math.abs(temp) / this.y_decimals;
      if (temp > this.height) this.height = temp;
      if (temp < this.min_y) this.min_y = temp;
      pointer = file.indexOf("X", pointer);
    }
    this.width -= this.min_x;
    this.height -= this.min_y;
    this.unit = "mm";
    if (file.indexOf("MOIN") != -1) this.unit = "in";
    if (this.verbose)
      console.log(
        "Board Dimensions: " +
          this.width.toFixed(2) +
          " x " +
          this.height.toFixed(2) +
          " " +
          this.unit
      );
  }

  store_apertures(file) {
    // [[id,type, radius, additional rect dimention]]
    this.apertures = {};
    var index = file.indexOf("ADD");
    while (index != -1) {
      var profile = [];
      var id_end = file.indexOf(",", index) - 1;
      var a_id = file.substring(index + 3, id_end);
      // store macro type
      profile.push(file[id_end]);
      // single dimension
      if (file.substring(index, file.indexOf("*", index)).indexOf("X") == -1) {
        profile.push(
          (parseFloat(
            file.substring(
              file.indexOf(",", index) + 1,
              file.indexOf("*", index)
            )
          ) /
            2) *
            this.scale
        );
        // two dimensions
      } else if (
        file
          .substring(file.indexOf("X", index) + 1, file.indexOf("*", index))
          .indexOf("X") == -1
      ) {
        profile.push(
          parseFloat(
            file.substring(
              file.indexOf(",", index) + 1,
              file.indexOf("X", index)
            )
          ) * this.scale
        );
        profile.push(
          parseFloat(
            file.substring(
              file.indexOf("X", index) + 1,
              file.indexOf("*", index)
            )
          ) * this.scale
        );
        // three dimensions
      } else {
        console.log("uhhhh");
        profile.push(
          parseFloat(
            file.substring(
              file.indexOf(",", index) + 1,
              file.indexOf("X", index)
            )
          ) * this.scale
        );
        profile.push(
          parseFloat(
            file.substring(
              file.indexOf("X", index) + 1,
              file.indexOf("X", index)
            )
          ) * this.scale
        );
        profile.push(
          parseFloat(
            file.substring(
              file.indexOf("X", index) + 1,
              file.indexOf("*", index)
            )
          ) * this.scale
        );
      }
      this.apertures[a_id] = profile;
      index = file.indexOf("ADD", index + 1);
    }
  }

  find_aperture_locations(file) {
    this.aperture_locs = [];
    for (var key in this.apertures) {
      var locs = this.get_all_indices(file, "D" + key + "*");
      locs.forEach((i) => this.aperture_locs.push([key, i]));
    }
    this.aperture_locs.sort((a, b) => a[1] - b[1]);
    this.find_macro_endings(file);
  }

  find_macro_endings(file) {
    var end_pos = 0;
    for (var i = 0; i < this.aperture_locs.length; i++) {
      var start_pos = this.aperture_locs[i][1];
      if (i == this.aperture_locs.length - 1) end_pos = file.length;
      else end_pos = this.aperture_locs[i + 1][1];
      this.aperture_locs[i].push(end_pos);
    }
  }

  get_all_indices(str, val) {
    var startIndex = 0,
      index,
      indices = [];
    while ((index = str.indexOf(val, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + 1;
    }
    return indices;
  }

  set_decimal_places(file) {
    var index = file.indexOf("FSLAX");
    this.x_decimals = file.substring(index + 6, index + 7);
    this.y_decimals = file.substring(index + 9, index + 10);
    this.x_decimals = Math.pow(10, this.x_decimals);
    this.y_decimals = Math.pow(10, this.y_decimals);
  }

  init_file(file) {
    this.set_decimal_places(file);
    this.store_apertures(file);
    this.find_aperture_locations(file);
  }
  //file handling
  extract_files(file) {
    if (this.verbose) console.log("Extracting Files");

    const AdmZip = require("adm-zip");

    var zip = new AdmZip(file);
    zip.extractAllTo(this.temp_path);
  }

  copy_files(file) {
    const temp_path = this.temp_path;
    fs.readdirSync(file).forEach((filename) => {
      fs.copyFileSync(file + "/" + filename, temp_path + "/" + filename);
    });
  }

  identify_files() {
    var unidentified_files = 0;
    var files = new Map();
    this.files = files;
    files["drill"] = "";
    files["outline"] = "";
    files["top_copper"] = "";
    files["top_mask"] = "";
    files["top_silk"] = "";
    files["bottom_copper"] = "";
    files["bottom_mask"] = "";
    files["bottom_silk"] = "";

    const temp_path = this.temp_path;

    fs.readdirSync(this.temp_path).forEach((filename) => {
      if (
        !files["drill"] &&
        filename.substring(filename.length - 3).toUpperCase() == "DRL"
      )
        files["drill"] = fs.readFileSync(temp_path + "/" + filename, "utf8");
      else if (
        !files["outline"] &&
        (filename.substring(filename.length - 3).toUpperCase() == "GKO" ||
          filename.substring(filename.length - 3).toUpperCase() == "GM1")
      )
        files["outline"] = fs.readFileSync(temp_path + "/" + filename, "utf8");
      else if (
        !files["top_copper"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GTL"
      )
        files["top_copper"] = fs.readFileSync(
          temp_path + "/" + filename,
          "utf8"
        );
      else if (
        !files["top_mask"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GTS"
      )
        files["top_mask"] = fs.readFileSync(temp_path + "/" + filename, "utf8");
      else if (
        !files["top_silk"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GTO"
      )
        files["top_silk"] = fs.readFileSync(temp_path + "/" + filename, "utf8");
      else if (
        !files["bottom_copper"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GBL"
      )
        files["bottom_copper"] = fs.readFileSync(
          temp_path + "/" + filename,
          "utf8"
        );
      else if (
        !files["bottom_mask"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GBS"
      )
        files["bottom_mask"] = fs.readFileSync(
          temp_path + "/" + filename,
          "utf8"
        );
      else if (
        !files["bottom_silk"] &&
        filename.substring(filename.length - 3).toUpperCase() == "GBO"
      )
        files["bottom_silk"] = fs.readFileSync(
          temp_path + "/" + filename,
          "utf8"
        );
      else unidentified_files += 1;
    });

    //Delete temp directory
    fs.rmdir(this.temp_path, { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });

    if (
      this.files["drill"] &&
      this.files["outline"] &&
      this.files["top_copper"] &&
      this.files["top_mask"]
    ) {
      if (this.verbose)
        console.log(
          "Files Loaded\nUnidentified Files: " + unidentified_files.toString()
        );
    } else console.log("Error identifying files");
  }
}

module.exports = Board;
