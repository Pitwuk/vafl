const fs = require("fs");
const path = require("path");
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

  render(output, { silk = true, drc = false }) {
    this.silk_bool = silk;
    this.drc = drc;

    if (drc) {
      // setup drc error bools
      this.drill_diameter_not_tenth_mm = false;
      this.drill_diameter_too_small = false;
      this.annular_ring_error = false; //TODO
      this.pad_to_pad_clearance_error = false; //TODO
      this.trace_clearance_error = false; //TODO
      this.trace_width_error = false;
      // setup capabilities
      this.min_trace_width = 0.127;
      this.min_trace_clearance = 0.127;
      this.min_annular_ring = 0.13;
      this.min_pad_to_pad = 0.2;
      this.min_drill_diameter = 0.3;
      // setup drc arrays
      this.traces = [];
      this.pads = [];
      this.drc_scale = 1;
    }
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
    // print drc results
    if (this.drc) {
      console.log("\nDesign Rules Check Results:");
      console.log(
        "Drill diameter not tenth of mm:" + this.drill_diameter_not_tenth_mm
      );
      console.log(
        "Drill diameter below minimum:" + this.drill_diameter_too_small
      );
      // console.log("Annular ring too small:" + this.annular_ring_error);
      // console.log(
      //   "Pad to pad clearance too small:" + this.pad_to_pad_clearance_error
      // );
      // console.log(
      //   "Trace to trace clearance too small:" + this.trace_clearance_error
      // );
      console.log("Trace width too small:" + this.trace_width_error);
    }
  }

  draw_svg(layer, filename) {
    this.copper_bool = false;

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
      .fill("darkgreen");
    // .fill("#f0e6aa");

    // if (this.verbose) console.log("Milling Outline");
    // this.init_file(this.files["outline"]);
    // this.draw_macros(this.files["outline"], "green");
    this.copper_bool = true;
    if (this.verbose) console.log("Etching Copper");
    this.init_file(layer + "_copper");
    this.clear_color = "darkgreen";
    this.draw_macros(this.files[layer + "_copper"], "green");
    this.copper_bool = false;

    if (this.files[layer + "_silk"] && this.silk_bool) {
      if (this.verbose) console.log("Curing Silk Screen");
      this.init_file(layer + "_silk");
      this.draw_macros(this.files[layer + "_silk"], "white");
    }

    if (this.verbose) console.log("Applying Solder Mask");
    this.init_file(layer + "_mask");
    this.draw_macros(this.files[layer + "_mask"], "grey");

    // draw drill holes
    if (this.verbose) console.log("Drilling Holes");
    this.drill_holes();

    // save svg
    fs.writeFileSync(this.output_folder + filename, this.drawing.svg());
  }

  draw_macros(file, color) {
    this.last_x = -1;
    this.last_y = -1;
    if (
      this.aperture_locs.length > 0 &&
      file.indexOf("X") < this.aperture_locs[0][1] &&
      file.indexOf("X") != -1
    ) {
      this.draw_section(
        file.substring(0, this.aperture_locs[0][1]),
        false,
        color
      );
    }
    this.aperture_locs.forEach((macro) => {
      if (file == this.files["outline"])
        this.polygon_fill(file.substring(macro[1], macro[2]), color);
      else
        this.draw_section(file.substring(macro[1], macro[2]), macro[0], color);
    });
  }

  draw_section(g_code, a_id, color) {
    var radius, shape;
    if (a_id) {
      radius = parseFloat(this.apertures[a_id][1]);
      shape = this.apertures[a_id][0];
    }
    var g_loc = 0;
    var x_loc = 0;
    x = this.last_x;
    y = this.last_y;
    this.fill_polarity = 1; //dark
    // indexOf all coords && draw path
    var path = "";
    g_loc = g_code.indexOf("G");

    //get fill polarity
    if (g_code.indexOf("LPC*%") < g_loc && g_code.indexOf("LPC*%") != -1)
      this.fill_polarity = 0;

    // case where no g code is present for first move
    x_loc = g_code.indexOf("X");
    if (x_loc < g_loc || g_loc == -1) {
      g_code = "G01*" + g_code.substring(x_loc);
      g_loc = 0;
    }

    while (true) {
      if (g_loc == -1) break;
      var code = g_code.substring(g_loc, g_loc + 3);
      if (code == "G37") code = "G01";
      if (code == "G36") {
        var next_code = g_code.indexOf("G37", g_loc);
        this.polygon_fill(g_code.substring(g_loc, next_code), color);
        g_loc = next_code;
      } else {
        var next_code = g_code.indexOf("G", g_loc + 1);
        x_loc = g_code.indexOf("X", g_loc + 1);
        while (
          (x_loc < next_code && x_loc != -1) ||
          (next_code == -1 && x_loc != -1)
        ) {
          var y_loc = g_code.indexOf("Y", x_loc);
          if (code == "G01") {
            var d_code = g_code.substring(
              g_code.indexOf("D", x_loc),
              g_code.indexOf("D", x_loc) + 3
            );
            if (d_code == "D01" && path == "" && x != -1)
              path += "M" + x + "," + y;
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
            } else if (d_code == "D01") {
              path += "L" + x + "," + y;
              if (this.drc && this.copper_bool && this.last_x != -1) {
                this.drc_check(
                  "trace",
                  radius,
                  [this.last_x, this.last_y],
                  [x, y]
                );
              }
            }
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
              }
              // else console.log(shape);
            }
          } else if (code == "G02" || code == "G03") {
            if (code == "G02") var sweep_flag = "0";
            else var sweep_flag = "1";
            path += this.draw_arc(
              g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
              sweep_flag,
              [x, y]
            );
          }
          // else console.log(code);
          x_loc = g_code.indexOf("X", x_loc + 1);
        }

        if (
          g_code.indexOf("LPC*%", g_loc) < next_code &&
          g_code.indexOf("LPC*%", g_loc) != -1
        )
          this.fill_polarity = 0;
        if (
          g_code.indexOf("LPD*%", g_loc) < next_code &&
          g_code.indexOf("LPD*%", g_loc) > g_code.indexOf("LPC*%", g_loc) &&
          g_code.indexOf("LPD*%", g_loc) != -1
        )
          this.fill_polarity = 1;
        g_loc = next_code;
      }
    }
    this.last_x = x;
    this.last_y = y;

    if (path)
      this.drawing
        .path(path)
        .stroke({ color: color, width: radius * 2 })
        .fill("none");
  }

  drc_check(p_type, radius, start_pos, end_pos) {
    radius /= this.scale / this.drc_scale;
    // start_pos[0] = float(start_pos[0]) / self.scale/self.drc_scale
    // start_pos[1] = float(start_pos[1]) / self.scale/self.drc_scale
    // end_pos[0] = float(end_pos[0]) / self.scale/self.drc_scale
    // end_pos[1] = float(end_pos[1]) / self.scale/self.drc_scale
    if (p_type == "trace") {
      // width check
      if (radius * 2 < this.min_trace_width) this.trace_width_error = true;
    }
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

    if (i_loc != -1) {
      var y =
        (Math.abs(parseFloat(g_code.substring(y_loc + 1, i_loc))) /
          this.y_decimals -
          this.min_y) *
        this.scale;
      i =
        (parseFloat(g_code.substring(g_code.indexOf("I") + 1, d_loc)) /
          this.x_decimals) *
        this.scale;
    } else
      var y =
        (Math.abs(parseFloat(g_code.substring(y_loc + 1, d_loc))) /
          this.y_decimals -
          this.min_y) *
        this.scale;

    var center = [parseFloat(start_pos[0]) + i, parseFloat(start_pos[1]) + j];

    var start_angle = this.find_angle(start_pos, center);
    var end_angle = this.find_angle([x, y], center);
    if (sweep_flag == "0") var angle = start_angle - end_angle;
    else var angle = end_angle - start_angle;

    if (!multiquadrant_bool && angle > 0.5) {
      if (sweep_flag == "0") angle = end_angle - start_angle;
      else angle = start_angle - end_angle;
    }
    if (angle >= 1) var large_arc_flag = 1;
    else var large_arc_flag = 0;

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
    while (true) {
      if (g_loc == -1) break;
      var code = g_code.substring(g_loc, g_loc + 3);
      if (code == "G36") code = "G01";
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
          if (code == "G02") var sweep_flag = "0";
          else var sweep_flag = "1";
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
    if (this.fill_polarity == 1)
      this.drawing
        .path(path)
        .stroke("none")
        .fill(color);
    else
      this.drawing
        .path(path)
        .stroke("none")
        .fill(this.clear_color);
  }

  drill_holes() {
    this.get_drill_decimals();
    this.get_drill_tools();
    var file = this.files["drill"].substring(this.drill_header_end);
    this.get_drill_locs(file);

    this.drill_tools.forEach((tool) => {
      var diameter = tool["diameter"];

      // draw all holes for current tool
      var section = file.substring(tool["start"], tool["end"]);

      var curr_x = section.indexOf("X");
      var curr_y = section.indexOf("Y", curr_x);

      // indexOf and draw circles at hole coords
      while (curr_x != -1) {
        var y_len = 1;
        if (
          section.substring(curr_y + 1, curr_y + 1 + y_len) == "+" ||
          section.substring(curr_y + 1, curr_y + 1 + y_len) == "-"
        )
          curr_y++;
        while (
          !isNaN(section.substring(curr_y + 1, curr_y + 1 + y_len)) &&
          y_len < 12
        ) {
          y_len += 1;
        }
        var hole_x =
          Math.abs(parseFloat(section.substring(curr_x + 1, curr_y))) /
          (section.substring(curr_x + 1, curr_y).indexOf(".") == -1
            ? this.drill_decimals
            : 1);
        var hole_y =
          Math.abs(
            parseFloat(section.substring(curr_y + 1, curr_y + 1 + y_len))
          ) /
          (section.substring(curr_y + 1, curr_y + 1 + y_len).indexOf(".") == -1
            ? this.drill_decimals
            : 1);
        this.drawing
          .circle(diameter * this.drill_scale)
          .center(
            hole_x * this.drill_scale - this.min_x * this.scale,
            hole_y * this.drill_scale - this.min_y * this.scale
          )
          .fill("black");
        curr_x = section.indexOf("X", curr_y);
        curr_y = section.indexOf("Y", curr_x);
      }
    });
  }

  get_drill_decimals() {
    var file = this.files["drill"];
    this.drill_scale = this.scale;
    var index = file.indexOf("METRIC");
    if (index != -1) {
      var initial = file.indexOf(".", index) + 1;
      var i = initial;
      if (i < file.indexOf("T", index) && i < file.indexOf(";", index)) {
        while (file[i] == "0") i++;
        this.drill_decimals = Math.pow(10, i - initial);
      } else {
        this.drill_decimals = 1000;
      }
      if (this.unit == "in") this.drill_scale = this.scale / 25.4;
    } else if (file.indexOf("INCH") != -1) {
      index = file.indexOf("INCH");
      initial = file.indexOf(".", index) + 1;
      i = initial;
      if (i < file.indexOf("T", index) && i < file.indexOf(";", index)) {
        while (file[i] == "0") i++;
        this.drill_decimals = Math.pow(10, i - initial);
      } else {
        this.drill_decimals = 10000;
      }
      if (this.unit == "mm") this.drill_scale = this.scale * 25.4;
    } else this.drill_decimals = 1000;
  }

  get_drill_tools() {
    var metric_drill_bool = true;
    this.drill_tools = [];
    var file = this.files["drill"];
    var tool_start = file.indexOf("METRIC") + 7;
    if (tool_start == 6) {
      tool_start = file.indexOf("INCH") + 5;
      metric_drill_bool = false;
    }
    this.drill_header_end = file.indexOf("%", tool_start);
    file = file.substring(tool_start, this.drill_header_end);
    file = this.remove_comments(file);

    var index = -2;
    var next_index = -2;
    while (next_index != file.length) {
      var curr_tool = {};

      if (next_index != -2) index = next_index;
      else {
        index = file.indexOf("T", index + 2);
        if (file.charAt(index + 1) == "Z") index = file.indexOf("T", index + 2);
      }

      if (index == -1) break;

      //set tool id and next tool id
      var c_index = file.indexOf("C", index);
      curr_tool["name"] = file.substring(index, c_index);

      next_index = file.indexOf("T", c_index);
      if (next_index == -1) {
        next_index = file.length;
        curr_tool["next"] = "";
      } else {
        curr_tool["next"] = file.substring(
          next_index,
          file.indexOf("C", next_index)
        );
      }

      //get diameter
      curr_tool["diameter"] = file.substring(c_index + 1, next_index);

      //drc checks
      if (this.drc && !this.drill_diameter_not_tenth_mm) {
        var diam = curr_tool["diameter"];
        if (!metric_drill_bool) diam *= 25.4;
        if (Math.floor(diam * 10) != diam * 10)
          this.drill_diameter_not_tenth_mm = true;
      }

      if (this.drc && !this.drill_diameter_too_small) {
        var diam = curr_tool["diameter"];
        if (!metric_drill_bool) diam *= 25.4;
        if (diam < this.min_drill_diameter)
          this.drill_diameter_too_small = true;
      }

      this.drill_tools.push(curr_tool);
    }
  }

  get_drill_locs(file) {
    this.drill_tools.forEach((tool) => {
      tool["start"] = file.indexOf(tool["name"]);
      tool["end"] = file.indexOf("T", tool["start"] + 1);
      if (tool["end"] == -1) tool["end"] = file.indexOf("M", tool["start"]);
    });
  }

  remove_comments(file) {
    var start_index = file.indexOf(";");

    while (start_index != -1) {
      var end_index = file.indexOf("\n", start_index);
      if (
        file.indexOf("\r", start_index) < end_index &&
        file.indexOf("\r", start_index) != -1
      )
        end_index = file.indexOf("\r", start_index);
      if (end_index == -1) end_index = file.length;
      file = file.substring(0, start_index) + file.substring(end_index);
      start_index = file.indexOf(";");
    }
    return file
      .split("\n")
      .join("")
      .split("\r")
      .join("");
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

  store_apertures(filename) {
    var file = this.files[filename];
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
    this.files[filename] = file.substring(
      file.indexOf("%", file.indexOf("ADD" + a_id)) + 1
    );
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

  init_file(filename) {
    this.set_decimal_places(this.files[filename]);
    this.store_apertures(filename);
    this.find_aperture_locations(this.files[filename]);
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

  infer_filetype(file, filename) {
    if (filename.substring(0, filename.length - 4).toUpperCase() == "PROFILE")
      this.files["outline"] = file;
    else if (file.toUpperCase().indexOf("TOP") != -1) {
      if (file.toUpperCase().indexOf("COPPER") != -1)
        this.files["top_copper"] = file;
      else if (file.toUpperCase().indexOf("SOLDERMASK") != -1)
        this.files["top_mask"] = file;
      else if (file.toUpperCase().indexOf("SILK") != -1)
        this.files["top_silk"] = file;
    } else if (file.toUpperCase().indexOf("BOTTOM") != -1) {
      if (file.toUpperCase().indexOf("COPPER") != -1)
        this.files["bottom_copper"] = file;
      else if (file.toUpperCase().indexOf("SOLDERMASK") != -1)
        this.files["bottom_mask"] = file;
      else if (file.toUpperCase().indexOf("SILK") != -1)
        this.files["bottom_silk"] = file;
    }
  }

  walk(dir) {
    // get the contents of dir
    fs.readdirSync(dir).forEach((filename) => {
      // get the item path
      let itemPath = path.join(dir, filename);
      // get the stats of the item
      const stats = fs.statSync(itemPath);
      // for now just use stats to find out
      // if the current item is a dir
      if (stats.isDirectory()) {
        // if so walk that too, by calling this
        // method recursively
        this.walk(itemPath);
      } else {
        if (
          (!this.files["drill"] &&
            filename.substring(filename.length - 3).toUpperCase() == "DRL") ||
          filename.substring(filename.length - 3).toUpperCase() == "XLN"
        )
          this.files["drill"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["outline"] &&
          (filename.substring(filename.length - 3).toUpperCase() == "GKO" ||
            filename.substring(filename.length - 3).toUpperCase() == "GM1")
        )
          this.files["outline"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["top_copper"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GTL"
        )
          this.files["top_copper"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["top_mask"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GTS"
        )
          this.files["top_mask"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["top_silk"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GTO"
        )
          this.files["top_silk"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["bottom_copper"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GBL"
        )
          this.files["bottom_copper"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["bottom_mask"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GBS"
        )
          this.files["bottom_mask"] = fs.readFileSync(itemPath, "utf8");
        else if (
          !this.files["bottom_silk"] &&
          filename.substring(filename.length - 3).toUpperCase() == "GBO"
        )
          this.files["bottom_silk"] = fs.readFileSync(itemPath, "utf8");
        else if (
          filename.substring(filename.length - 3).toUpperCase() == "GBR"
        ) {
          var temp = fs.readFileSync(itemPath, "utf8");
          this.infer_filetype(temp, filename);
        } else this.unidentified_files += 1;
      }
    });
  }

  identify_files() {
    this.unidentified_files = 0;
    var files = new Map();
    files["drill"] = "";
    files["outline"] = "";
    files["top_copper"] = "";
    files["top_mask"] = "";
    files["top_silk"] = "";
    files["bottom_copper"] = "";
    files["bottom_mask"] = "";
    files["bottom_silk"] = "";
    this.files = files;

    const temp_path = this.temp_path;
    this.walk(temp_path);

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
          "Files Loaded\nUnidentified Files: " +
            this.unidentified_files.toString()
        );
    } else console.log("Error identifying files");
  }
}

module.exports = Board;
