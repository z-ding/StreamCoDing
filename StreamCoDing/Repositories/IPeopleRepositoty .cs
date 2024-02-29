using System;
using System.Collections.Generic;
using StreamCoDing.Entities;

namespace StreamCoDing.Repositories
{
    //return Task<...> to indicate it's an async function, if original void type, just return Task
    public interface IPeopleRepository
    {
        Task<People> GetPeopleAsync(Guid id);
        Task<IEnumerable<People>> GetPeopleAsync();
        Task CreatePeopleAsync(People person);
        Task UpdatePeopleAsync(People person);
        Task DeletePeopleAsync(Guid id);
    }
}
