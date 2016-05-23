USE scholarships
GO
CREATE PROCEDURE usp_GetProviderById
    @Id int
AS 

SET NOCOUNT ON;
DECLARE @Providers xml ;
SET @Providers = (SELECT * FROM [scholarships].[dbo].[providers] WHERE clientId = @Id FOR XML path, root)

SELECT Stuff ( 
  (SELECT * from 
    (SELECT ',
    {'+ 
      Stuff((SELECT ',"'+ coalesce(b.c.value('local-name(.)' , 'NVARCHAR(MAX)'),'' )+'":"'+
                    b.c.value('text()[1]' ,'NVARCHAR(MAX)') +'"'            
             from x. a.nodes ('*') b(c ) 
             for xml path( ''),TYPE ).value( '(./text())[1]','NVARCHAR(MAX)' )
        ,1, 1,'' )+'}'
   from @Providers.nodes('/root/*') x (a)  
   )JSON(theLine ) for xml path (''), TYPE).value ('.', 'NVARCHAR(MAX)' ),1, 1,'' ) AS [json]
  
GO


