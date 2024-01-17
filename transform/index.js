let j = require('jscodeshift')
const path = require('path')
const fs = require('fs')

// 需要使用 babylon 解析器
j = j.withParser('babylon')

const source = fs.readFileSync(path.resolve(__dirname, '6.0cf1335d.js'), {encoding: 'utf-8'})


/**
 * 查找指定的方法，返回对应的函数表达式节点
 * @param root 根节点
 * @param name 方法名
 * @return {FunctionExpression}
 */
function findMethod(root, name) {
    return root.find(j.ObjectProperty, node => {
        return j.StringLiteral.check(node.key) && node.key.value === name && j.FunctionExpression.check(node.value)
    }).map(path => path.get('value'))
}

// 删除 eventProtect 方法体
function deleteEventProtectMethodBody(root) {
    findMethod(root, 'eventProtect').forEach(path => {
        path.get('body').replace(j.blockStatement([]))
    })
}

function fixButtonCode(root, btn) {
    findMethod(root, btn).forEach(path => {
        const statements = path.get('body', 'body').value
        if (statements.length === 1 && j.ExpressionStatement.check(statements[0])) {
            const expression = statements[0].expression
            if (j.LogicalExpression.check(expression) && j.CallExpression.check(expression.right)) {
                statements[0].expression = expression.right
            }
        }
    })
}

const root = j(source)

function handle(root) {
    deleteEventProtectMethodBody(root)
    fixButtonCode(root, 'handleClickNextChapterButton')
    fixButtonCode(root, 'handleClickPrevChapterButton')
    fixButtonCode(root, 'handleClickPrevSectionButton')
    fixButtonCode(root, 'handleClickNextSectionButton')
}

handle(root)


// console.log(root.toSource())

fs.writeFileSync(path.resolve(__dirname, 'fix.js'), root.toSource(), {encoding: 'utf-8'})
