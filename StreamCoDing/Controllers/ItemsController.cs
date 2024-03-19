using Microsoft.AspNetCore.Mvc;
using StreamCoding.Dtos;
using StreamCoDing.Dtos;
using StreamCoDing.Entities;
using StreamCoDing.Repositories;

namespace StreamCoDing.Controllers
{
    [ApiController]//mark controller as APi controller
    [Route("items")] //define route: to which http route these controllers are responding
    public class ItemsController : ControllerBase
    {
        //private readonly InMemItemsRepository repository;
        //if we create an instance of repository every time we have http get request, a new set of guid will be generated
        //so we will never be able to find a id, we need dependancy injection here
        //we need to create an interface to have all dependancies where our ItemsController need
        //1.go to repository class and click extract interface
        //2. do the interface registration in startup.cs
        private readonly IItemsRepository repository;
        public ItemsController(IItemsRepository repository)
        {//dependancy injection
            this.repository = repository;
        }
        //Get / items
        [HttpGet]
        public async Task<IEnumerable<ItemDto>> GetItemsAsync()
        {//getitems will be responding to a get request
            var items = (await repository.GetItemsAsync())
                        .Select(item => item.AsDto());
            return items;
        }
        //Get/items/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ItemDto>> GetItemAsync(Guid id)
        {//actionresult type allows us to return more than one data type
            var item = await repository.GetItemAsync(id);
            if (item is null)
            {
                return NotFound();
            }
            return item.AsDto();
        }
        //Post / items
        [HttpPost]
        public async Task<ActionResult<ItemDto>> CreateItemAsync(CreateItemDto itemDto)
        {
            Item item = new()
            {
                Id = Guid.NewGuid(),
                Name = itemDto.Name,
                Type = itemDto.Type,
                Description = itemDto.Description,
                Number = itemDto.Number,
                CreatedDate = DateTimeOffset.UtcNow,
                TestCases = itemDto.TestCases
            };
            await repository.CreateItemAsync(item);
            //convention for return: specify where you can get the item created in the return, how (id) and the actual item dto object
            return CreatedAtAction(nameof(GetItemAsync), new { id = item.Id }, item.AsDto());
        }

        [HttpPut("{id}")]
        //put / items / {id}
        //update route usually doesn't return anything
        public async Task<ActionResult> UpdateItemAsync(Guid id, UpdateItemDto itemDto)
        {
            var existingItem = await repository.GetItemAsync(id);
            if (existingItem is null) return NotFound();
            //record type with expression: create a copy of the item with the following property modified
            Item updatedItem = existingItem with
            {
                Name = itemDto.Name,
                Type = itemDto.Type,
                Description = itemDto.Description,
                Number = itemDto.Number,
                TestCases = itemDto.TestCases
            };
            await repository.UpdateItemAsync(updatedItem);
            return NoContent();
        }
        //delete / items / {id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteItemAsync(Guid id)
        {
            var existingItem = await repository.GetItemAsync(id);
            if (existingItem is null) return NotFound();
            await repository.DeleteItemAsync(id);
            return NoContent();
        }
    }
}