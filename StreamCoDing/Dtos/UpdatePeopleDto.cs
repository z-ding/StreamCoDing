using System.ComponentModel.DataAnnotations;
namespace StreamCoDing.Dtos
{
    public record UpdatePeopleDto
    {//record is similar to class, but support immutable data and value equal comparison for objects
     //add data annotations to prevent user post invalid data like null name
        [Required]
        public string Name { get; init; }
    }
}
