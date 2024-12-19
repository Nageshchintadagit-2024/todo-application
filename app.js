const express = require('express')

const format = require('date-fns/format')

const isValid = require('date-fns/isValid')

const path = require('path')

const app = express()

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'todoApplication.db')



app.use(express.json())

let dbConnection = null

const initializeDbAndServer = async () => {
  try {
    dbConnection = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Successfully Running.....')
    })
  } catch (error) {
    console.log(`DB Error:${error.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

convertRequestObjectToResponseObject = requestObject => {
  return {
    id: requestObject.id,
    todo: requestObject.todo,
    priority: requestObject.priority,
    status: requestObject.status,
    category: requestObject.category,
    dueDate: requestObject.due_date,
  }
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}
const hasTodoProperty = requestQuery => {
  return requestQuery.todo !== undefined
}
const hasDuedateProperty = requestQuery => {
  return requestQuery.dueDate !== undefined
}
const hasSearch_qProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasPriorityAndStatusProperty = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndStatusProperty = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndPriorityProperty = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

const isValidStatusProperty = requestedObject => {
  const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
  return statusArray.includes(requestedObject.status)
}

const isValidPriorityProperty = requestedObject => {
  const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
  return priorityArray.includes(requestedObject.priority)
}

const isValidCategoryProperty = requestedObject => {
  const cArray = ['WORK', 'HOME', 'LEARNING']
  return cArray.includes(requestedObject.category)
}

//API 1

app.get('/todos/', async (request, response) => {
  let getQuery = ''
  let data = ''
  const {search_q = '', priority, status, category} = request.query
  if (hasPriorityAndStatusProperty(request.query)) {
    if (isValidPriorityProperty(request.query)) {
      if (isValidStatusProperty(request.query)) {
        getQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}'`
        data = await dbConnection.all(getQuery)
        response.send(
          data.map(each => convertRequestObjectToResponseObject(each)),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else if (hasCategoryAndPriorityProperty(request.query)) {
    if (isValidCategoryProperty(request.query)) {
      if (isValidPriorityProperty(request.query)) {
        getQuery = `
        select * from todo where category = '${category}' and priority = '${priority}'
        `
        data = await dbConnection.all(getQuery)
        response.send(
          data.map(each => convertRequestObjectToResponseObject(each)),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else if (hasCategoryAndStatusProperty(request.query)) {
    if (isValidCategoryProperty(request.query)) {
      if (isValidStatusProperty(request.query)) {
        getQuery = `select * from todo where category ='${category}' and status='${status}'`
        data = await dbConnection.all(getQuery)
        response.send(
          data.map(each => convertRequestObjectToResponseObject(each)),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else if (hasStatusProperty(request.query)) {
    if (isValidStatusProperty(request.query)) {
      getQuery = `select * from todo where status= '${status}'`
      data = await dbConnection.all(getQuery)
      response.send(
        data.map(each => convertRequestObjectToResponseObject(each)),
      )
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else if (hasPriorityProperty(request.query)) {
    if (isValidPriorityProperty(request.query)) {
      getQuery = `select * from todo where priority= '${priority}'`
      data = await dbConnection.all(getQuery)
      response.send(
        data.map(each => convertRequestObjectToResponseObject(each)),
      )
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else if (hasCategoryProperty(request.query)) {
    if (isValidCategoryProperty(request.query)) {
      getQuery = `select * from todo where category= '${category}'`
      data = await dbConnection.all(getQuery)
      response.send(
        data.map(each => convertRequestObjectToResponseObject(each)),
      )
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else if (hasSearch_qProperty(request.query)) {
    getQuery = `select * from todo where todo like '%${search_q}%'`
    data = await dbConnection.all(getQuery)
    response.send(data.map(each => convertRequestObjectToResponseObject(each)))
  } else {
    getQuery = `SELECT * FROM todo;`
    data = await dbConnection.all(getQuery)
    response.send(
      data.map(eachObj => convertRequestObjectToResponseObject(eachObj)),
    )
  }
})

//API 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const result = await dbConnection.get(getQuery)
  response.send(convertRequestObjectToResponseObject(result))
})

//API 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isValid(new Date(date)))

  if (date !== undefined) {
    if (isValid(new Date(date))) {
      const formattedString = format(new Date(date), 'yyyy-MM-dd')
      console.log(formattedString == date)
      const getQuery = `SELECT * FROM todo WHERE due_date = '${formattedString}'`
      const res = await dbConnection.all(getQuery)
      console.log(res)

      response.send(
        res.map(eachObject => convertRequestObjectToResponseObject(eachObject)),
      )
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
})

//API 4
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (!isValidPriorityProperty(request.body)) {
    response.status(400).send('Invalid Todo Priority')
  } else if (!isValidStatusProperty(request.body)) {
    response.status(400).send('Invalid Todo Status')
  } else if (!isValidCategoryProperty(request.body)) {
    response.status(400).send('Invalid Todo Category')
  } else if (!isValid(new Date(dueDate))) {
    response.status(400).send('Invalid Due Date')
  } else {
    const formattedDate = format(new Date(dueDate), 'yyyy-MM-dd')
    const getQuery = `
          INSERT INTO todo (id,todo,priority,status,category,due_date)
          VALUES(${id}, '${todo}', '${priority}', '${status}', '${category}', '${formattedDate}')
        `
    await dbConnection.run(getQuery)
    response.send('Todo Successfully Added')
  }
})

//API 5
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let getQuery = ''

  const {status, priority, todo, category, dueDate} = request.body

  if (hasStatusProperty(request.body)) {
    if (isValidStatusProperty(request.body)) {
      getQuery = `
    UPDATE todo SET status='${status}' WHERE id='${todoId}'
    `
      await dbConnection.run(getQuery)
      response.send('Status Updated')
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else if (hasPriorityProperty(request.body)) {
    if (isValidPriorityProperty(request.body)) {
      getQuery = `
    UPDATE todo SET priority='${priority}' WHERE id='${todoId}'
    `
      await dbConnection.run(getQuery)

      response.send('Priority Updated')
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  } else if (hasCategoryProperty(request.body)) {
    if (isValidCategoryProperty(request.body)) {
      getQuery = `
      UPDATE todo SET category ='${category}' WHERE id=${todoId}
      `
      await dbConnection.run(getQuery)
      response.send('Category Updated')
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  } else if (hasDuedateProperty(request.body)) {
    if (isValid(new Date(dueDate))) {
      const formatted = format(new Date(dueDate), 'yyyy-MM-dd')
      getQuery = `
    
    UPDATE todo SET due_date = '${formatted}' WHERE id =${todoId}
    
    `
      await dbConnection.run(getQuery)
      response.send('Due Date Updated')
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  } else if (hasTodoProperty(request.body)) {
    getQuery = `
     UPDATE todo SET todo= '${todo}' WHERE id='${todoId}'`
    await dbConnection.run(getQuery)
    response.send('Todo Updated')
  }
})

//API 6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `DELETE FROM todo WHERE id=${todoId}`
  await dbConnection.run(getQuery)
  response.send('Todo Deleted')
})

module.exports = app
