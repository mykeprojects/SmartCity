export interface CategoryNode{
    id: number;
    name: string;
    children: CategoryNode[];
    amountOfMembers: number;
}