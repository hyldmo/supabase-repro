import { useEffect, useReducer } from 'react'
import { supabase } from './utils'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Todo = {
	id: number
	text: string
}

type LoadAction = {
	eventType: 'load'
	payload: Todo[]
}

function reducer(state: Todo[], action: LoadAction | RealtimePostgresChangesPayload<Todo>) {
	console.log(action)
	switch (action.eventType) {
		case 'load':
			return action.payload

		case 'INSERT':
			return [...state, action.new]

		case 'UPDATE':
			return state.map(todo => (todo.id === action.new.id ? action.new : todo))

		case 'DELETE':
			return state.filter(todo => todo.id !== action.old.id)

		default:
			throw new Error()
	}
}

export function App() {
	const [state, dispatch] = useReducer(reducer, [])

	useEffect(() => {
		supabase
			.from('todos')
			.select('*')
			.then(({ data, error }) => {
				if (error) console.error(error)
				else dispatch({ eventType: 'load', payload: data })
			})
	}, [])

	useEffect(() => {
		const channel = supabase
			.channel('todos')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, dispatch)
			.subscribe()
		return () => {
			channel.unsubscribe()
		}
	}, [])

	return (
		<>
			<h1>Todos</h1>
			<div className="card">
				<button onClick={async () => supabase.from('todos').insert({ text: `Task ${state.length + 1}` })}>
					Add todo
				</button>
				<p>Number of todos is {state.length}</p>
				<ul>
					{state.map(todo => (
						<li key={todo.id}>{todo.text}</li>
					))}
				</ul>
			</div>
		</>
	)
}
