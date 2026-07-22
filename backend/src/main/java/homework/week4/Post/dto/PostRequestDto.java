package homework.week4.Post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PostRequestDto {

    @Size(max=26,message = "제목 글자 수는 최대 26자입니다.")
    @NotBlank(message ="제목은 필수값 입니다.")
    private String title;

    @NotBlank(message ="게시글 본문은 필수값 입니다.")
    private String content;

    private MultipartFile postImage;

    // 새 파일 없이 이 값이 true면 기존 이미지를 제거(null 저장). 프론트가 명시적으로 보낼 때만 true.
    private boolean removeImage;

}
