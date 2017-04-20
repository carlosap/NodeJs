module.exports = {

    //http://localhost:1337/todo/get
    Get: function (req, res) {
        TodoService.getTodos(function (todos) {
            res.json(todos);
        });
    },

    //http://localhost:1337/todo/add?value=my
    Add: function (req, res) {
        var todoVal = (req.query.value) ? req.query.value : undefined
        TodoService.addTodo(todoVal, function (success) {
            res.json(success);
        });
    },

    //http://localhost:1337/todo/remove?value=9    Method: delete
    Remove: function (req, res) {
        var todoVal = (req.query.value) ? req.query.value: undefined
        TodoService.removeTodo(todoVal, function (success) {
            res.json(success);
        });
    },

    //Action- Method: Get URL: http://localhost:1337/todo/adore
    adore: function (req, res) {
        res.send("I adore pets!");
    }
};