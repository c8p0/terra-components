import { TerraBaseTable } from './terra-base-table';

fdescribe('TerraBaseTable', () =>
{
    let baseTable:TerraBaseTable<any> = new TerraBaseTable<any>();

    it('should create', () =>
    {
        expect(baseTable).toBeTruthy();
    });

    it('should return an empty array for #selectedRowList', () =>
    {
        expect(baseTable.selectedRowList).toBeDefined();
        expect(baseTable.selectedRowList.length).toEqual(0);
    });
});
