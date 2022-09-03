export default {
    execute(interaction, options) {
        function factorial(n) {
            if (isNaN(n)) {
                throw new Error("An error occurred whilst parsing.");
            }

            if (+n === 0) {
                return 1;
            }

            return +n * factorial(+n - 1);
        }

        let functions = {};
        function handle(input) {
            try {
                let split = input.replace(/\s+/g, "");
                let vbls = split.match(/\w+=[^;]*/gi);
                if (vbls !== null) {
                    for (const variable of vbls) {
                        let vbl = variable.split("=");
                        globalThis[vbl[0]] = vbl[1];
                    }
                }

                // Declaring function
                let fns = split.match(/\w+\(\D+\)=[^;]*/gi);
                if (fns !== null) {
                    for (const fn of fns) {
                        let fname = fn.match(/^\w+/i)?.shift();
                        if (fname != null) {
                            let fnregex = fname + "\\((\\d+,?)*\\)=[^;]*";
                            functions[fname] = functions[fname] || {};
                            functions[fname].args = fn.match(/(?<=\()[^)]*/i)?.shift().split(/,+/g);
                            functions[fname].limit = split.match(new RegExp(fnregex, "gi"))?.shift().replace(/^[^\(][^\d+)]*/gi, "").split(")=");
                            split = split.replace(new RegExp(fnregex + ";?", "gi"), "");

                            let definition = fn.match(/(?<=\w+\(\w+\)=)[^;]*/gi)?.shift();
                            if (definition.match(new RegExp(fname + "\\(.*\\)", "gi")) === null) {
                                functions[fname].limit = false;
                            }

                            // Executing functions (MAKE SURE THEY CAN'T RECURSE IF THEY DON'T HAVE A LIMIT)
                            globalThis[fname] = function() {
                                if (functions[fname].limit == void 0) {
                                    return "You must define a limit before calling recursive functions.";
                                } else if (arguments[0] == functions[fname].limit[0]) {
                                    return functions[fname].limit[1];
                                }

                                for (const argument of functions[fname].args) {
                                    globalThis[argument] = +arguments[functions[fname].args.indexOf(argument)];
                                }

                                return handle(definition);
                            }
                        }
                    }
                }

                split = split.replace(/\w+\(\D+\)=[^;]*;?/gi, "");
                console.log(split);
                return eval(split
                .replace(/(?=sin|cos|tan|floor|round|ceil|log|pi)/gi, "Math.")
                .replace(/(\d+)\^(\d+)/gi, "Math.pow($1,$2)")
                .replace(/\|(.+?)\|/g, "Math.abs($1)")
                .replace(/⌊(.+?)⌋/g, "Math.floor($1)")
                .replace(/⌈(.+?)⌉/g, "Math.ceil($1)")
                .replace(/(\d+)!/gi, "factorial($1)")
                .replace(/phi/gi, (1 + Math.sqrt(5)) / 2)
                .replace(/mod/gi, "%"));
            } catch(error) {
                console.log(error)
                return error.message;
            }
        }

        let response = handle(options.getString("input"));
        return {
            content: response.toString(),
            ephemeral: true
        }
    },
    data: {
        description: "Because you love math so much-",
        options: [{
            name: "input",
            description: "Enter your formula followed by n to execute the formula.",
            required: true,
            type: 3
        }]
    }
}