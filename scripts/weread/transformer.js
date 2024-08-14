import jscodeshift from 'jscodeshift'


// 需要使用 babylon 解析器
const j = jscodeshift.withParser('babylon')


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
        for (const statement of statements) {
            if (j.ExpressionStatement.check(statement)) {
                const expression = statement.expression
                if (j.LogicalExpression.check(expression) && j.CallExpression.check(expression.right)) {
                    statement.expression = expression.right
                }
            }
        }
    })
}

function handle(root) {
    deleteEventProtectMethodBody(root)
    fixButtonCode(root, 'handleClickNextChapterButton')
    fixButtonCode(root, 'handleClickPrevChapterButton')
    fixButtonCode(root, 'handleClickPrevSectionButton')
    fixButtonCode(root, 'handleClickNextSectionButton')
}

export function transform(input) {
    const root = j(input)
    handle(root)
    return root.toSource()
}
