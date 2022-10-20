import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

// todo list
// user can see todo list
// user can add item to todo list
// user can delete item from todo list
// user can toggle todo status

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center gap-2">
        {sessionData && (
          <p className="text-2xl text-blue-500">
            Logged in as {sessionData?.user?.name}
          </p>
        )}
        <button
          className="rounded-md border border-black bg-violet-50 px-4 py-2 text-xl shadow-lg hover:bg-violet-100"
          onClick={sessionData ? () => signOut() : () => signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>

      {sessionData && (
        <div className="flex flex-col gap-3 py-6">
          <CreateTodo />
          <TodoList />
        </div>
      )}
    </main>
  );
};

export default Home;

const CreateTodo = () => {
  const ctx = trpc.useContext();
  const todoCreateMutation = trpc.todo.create.useMutation({
    onSuccess() {
      ctx.todo.getAll.refetch();
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (todoCreateMutation.isLoading) {
          return;
        }
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries()) as {
          title: string;
        };
        todoCreateMutation.mutate({
          title: data.title,
        });
      }}
    >
      <div className="flex flex-col rounded border p-3">
        <label className="font-semibold" htmlFor="title">
          What do you want to do?
        </label>
        <input
          className="outline-none"
          name="title"
          type="text"
          placeholder="Please tell me..."
        />
      </div>
      {todoCreateMutation.isError && (
        <div className="rounded bg-red-500 p-3 text-lg">
          {todoCreateMutation.error.message}
        </div>
      )}
    </form>
  );
};

const TodoList = () => {
  const todos = trpc.todo.getAll.useQuery();
  const todoToggleMutation = trpc.todo.toggle.useMutation({
    onSuccess() {
      todos.refetch();
    },
  });

  if (todos.isLoading) {
    return <div>Loading....</div>;
  }

  if (todos.isError) {
    return (
      <div className="rounded bg-red-500 p-3 text-lg">
        An error ocurred, very sorry
      </div>
    );
  }

  if (todos.data.length === 0) {
    return (
      <div className="rounded bg-yellow-500 p-3 text-lg">
        There are no todos at the moment
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {todos.data.map((todo) => (
        <div
          key={todo.id}
          className={`rounded bg-green-300 p-3 text-lg ${
            todo.isDone ? "line-through" : ""
          }`}
          onClick={() => {
            todoToggleMutation.mutate({
              id: todo.id,
            });
          }}
        >
          {todo.title}
        </div>
      ))}
    </div>
  );
};
