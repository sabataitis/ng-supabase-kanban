export type User = {
    id: string
    name: string
    email: string
}

export type Board = {
    id: string
    name: string
    description: string
    created_by: string
}

export type List = {
    id: string
    board_id: string
    name: string
    position: number
}

export type Task = {
    id: string
    list_id: string,
    created_by: string,
    title: string,
    description: string,
    position: number,
}


