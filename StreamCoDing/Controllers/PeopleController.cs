using Microsoft.AspNetCore.Mvc;
using StreamCoding.Dtos;
using StreamCoDing.Dtos;
using StreamCoDing.Entities;
using StreamCoDing.Repositories;

namespace StreamCoDing.Controllers
{
    [ApiController]//mark controller as APi controller
    [Route("People")] //define route: to which http route these controllers are responding
    public class PeopleController : ControllerBase
    {
        //private readonly InMemPeopleRepository repository;
        //if we create an instance of repository every time we have http get request, a new set of guid will be generated
        //so we will never be able to find a id, we need dependancy injection here
        //we need to create an interface to have all dependancies where our PeopleController need
        //1.go to repository class and click extract interface
        //2. do the interface registration in startup.cs
        private readonly IPeopleRepository repository;
        public PeopleController(IPeopleRepository repository)
        {//dependancy injection
            this.repository = repository;
        }
        //Get / People
        [HttpGet]
        public async Task<IEnumerable<PeopleDto>> GetPeopleAsync()
        {//getPeople will be responding to a get request
            var P = (await repository.GetPeopleAsync())
                        .Select(persons => persons.AsDto());
            return P;
        }
        //Get/People/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PeopleDto>> GetPeopleAsync(Guid id)
        {//actionresult type allows us to return more than one data type
            var person = await repository.GetPeopleAsync(id);
            if (person is null)
            {
                return NotFound();
            }
            return person.AsDto();
        }
        //Post / People
        [HttpPost]
        public async Task<ActionResult<PeopleDto>> CreatePeopleAsync(CreatePeopleDto PeopleDto)
        {
            People People = new()
            {
                Id = Guid.NewGuid(),
                Name = PeopleDto.Name,
                CreatedDate = DateTimeOffset.UtcNow
            };
            await repository.CreatePeopleAsync(People);
            //convention for return: specify where you can get the People created in the return, how (id) and the actual People dto object
            return CreatedAtAction(nameof(GetPeopleAsync), new { id = People.Id }, People.AsDto());
        }

        [HttpPut("{id}")]
        //put / People / {id}
        //update route usually doesn't return anything
        public async Task<ActionResult> UpdatePeopleAsync(Guid id, UpdatePeopleDto PeopleDto)
        {
            var existingPeople = await repository.GetPeopleAsync(id);
            if (existingPeople is null) return NotFound();
            //record type with expression: create a copy of the People with the following property modified
            People updatedPeople = existingPeople with
            {
                Name = PeopleDto.Name,
            };
            await repository.UpdatePeopleAsync(updatedPeople);
            return NoContent();
        }
        //delete / People / {id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePeopleAsync(Guid id)
        {
            var existingPeople = await repository.GetPeopleAsync(id);
            if (existingPeople is null) return NotFound();
            await repository.DeletePeopleAsync(id);
            return NoContent();
        }
    }
}