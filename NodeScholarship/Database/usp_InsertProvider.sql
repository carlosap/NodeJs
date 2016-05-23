USE [scholarships]
GO
DROP PROCEDURE [dbo].[usp_InsertProvider]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

create  PROCEDURE [dbo].[usp_InsertProvider]

		@CliendId as INT,
        @Name as NVARCHAR(50),
		@Type as NVARCHAR(50),
		@WebSite as NVARCHAR(400),
		@Url as NVARCHAR(400),
		@Value as MONEY,
		@StrValue as NVARCHAR(50),
		@Description as NVARCHAR(50),
		@State as NVARCHAR(50),
		@ShortUrl as NVARCHAR(400),
		@Misc as NTEXT

AS
BEGIN
IF EXISTS(SELECT 1 FROM [dbo].[providers] WHERE clientId = @CliendId)
	BEGIN
		UPDATE [dbo].[providers]
			SET name = @Name,
			 [type] = @Type,
			 website = @WebSite,
			 url = @Url,
			 value = @Value,
			 strvalue = @StrValue,
			 description = @Description,
			 state = @State,
			 surl = @ShortUrl,
			 misc = @Misc,
			 lastupdate = CURRENT_TIMESTAMP
			 WHERE clientId = @CliendId

	END
ELSE
	BEGIN
		INSERT INTO [dbo].[providers](clientId,name,type,website,url,value,strvalue,description,state,surl,misc,created,lastupdate)
		 VALUES (@CliendId,@Name,@Type,@WebSite,@Url,@Value,@StrValue,@Description,@State,@ShortUrl,@Misc,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
	END
END



GO


