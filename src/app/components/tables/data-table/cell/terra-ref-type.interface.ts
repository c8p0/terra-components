export enum TerraRefTypeEnum
{
    email = 'mailto',
    phone = 'tel',
    function = 'function'
}

export interface TerraRefTypeInterface
{
    type:TerraRefTypeEnum;
    value:string;
    caption?:string | number;
    func?:() => void;
}
